# 项目问题

项目需要读取本地文件，所以提供一个服务读取文件，本项目采用node.js + koa2

## 返回数据列表

过程：读取文件 -> 处理文件数据 -> 增加筛选条件 -> 返回列表数据和统计收入、支出金额

- 问题一：如何把数据转换成json数据格式？

    读取文件

    ```
    let filePath = path.resolve(__dirname, '../static/bill.csv')
    const buffer = fs.readFileSync(filePath, 'utf8')
    console.log(buffer)
    ```

    文件数据

    ```
    type,time,category,amount\n1,1660471966989,5il79e11628,3234\n1,1660471062003,8s0p77c323,52000\n0,1660455000751,,33333\n0,1660408626730,odrjk823mj8,333\n0,1660408604987,8s0p77c323,3333\n1,1660406483026,1bcddudhmh,11111\n1,1660398201454,1vjj47vpd28,3323\n0,1561910400000,8s0p77c323,5400\n0,1561910400000,0fnhbcle6hg,1500\n0,1563897600000,3tqndrjqgrg,3900
    ```
    分析文件数据，不难看出，每列数据可以用'\n'进行分割，每项数据可以用','分割，因而可根据此规则格式化数据：

    ```
    /**
    * csv 转 json 对象
    * @param {String} data csv返回的文件字符串
    * @returns Array
    */
    const CsvToJson = (data) => {
        return new Promise((resolve, reject) => {
            data = data.toString()
            let list = new Array()
            let rows = data.split("\n")
            let keys = rows[0].split(',')
            let item = []
            for (var i = 1; i < rows.length; i++) {
                item = rows[i].split(",")
                let obj = {}
                for(let j = 0; j < item.length; j++) {
                    obj[keys[j]] = isNaN(item[j]) ? item[j] :  + item[j]
                }
                list.push(obj)
            }
            resolve(list)
        })
    }
    ```
    根据数据可以知道，通过split("\n")分割后，数组rows[0]为数据的键位(key)，1 ~ rwo.leng为值位（value)。因为数据的位置是一一对应的，可对rows数组进行遍历，然后split(",")分割其每一项数据遍历设置对应的值，生成对象压入数组后返回。同样，分类数据也可以这么处理。分类列表数据也做同样的处理。

- 问题二：如何对数据条件筛选？

月份、账单分类、账单类型筛选通过对数据进行遍历处理

```
/**
 * 
 * @param {Array} data 数据
 * @param {object} body 请求参数
 * @returns 筛选返回列表
 */
const filterBills = (data, body) => {
    let { month, type, category } = body
    let list = []
    let expenditure = 0 // 支出
    let income = 0 // 收入
    for(let i = 0; i < data.length; i++) {
        if(month && (new Date(data[i].time).getMonth() + 1 != month)) { // 月份筛选
            continue
        }
        if((type + '') && type != null && data[i].type != type) { // 类型
            continue
        }
        if(category && data[i].category != category) { // 类型
            continue
        }
        if(data[i].type) {
            income += data[i].amount * 1000 // ？数据中存在正负收入
        } else {
            expenditure += data[i].amount * 1000
        }
        list.push(data[i])
    }
    return { data: list, expenditure: (expenditure / 1000).toFixed(2) , income: (income / 1000).toFixed(2) }
}
```
对格式化好的数据进行遍历，根据是否符合月份、分类的数据压入数组，不符合的跳出本次循环，同时循环中统计收入和支出。收入和支出通过*1000再相加，简单处理浮点类型相加精度问题


## 创建订单

过程：前端发起请求 -> 后端数据检验 -> 读取订单文件数据 -> 拼接数据存入文件

- 问题一：订单创建时间？

    订单创建时间可以是前端传值也可以是后端设置，本项目使用后端获取当前时间实现。

    ```
    router.post('/create', async (ctx) => {
        let { type, category, amount } = ctx.request.body
        let {err, isValid} = ListValidator(ctx.request.body)
        if(!isValid) {
            const error = new HttpException('参数错误', err)
            throw error
        }
        let filePath = path.resolve(__dirname, '../static/bill.csv')
        let buffer = fs.readFileSync(filePath, 'utf8')
        let time = Date.now()
        buffer = buffer.split('\n')
        buffer.splice(1, 0, `${type},${time},${category},${amount}`) // 数据前面插入
        buffer = buffer.join('\n')
        fs.writeFileSync(filePath, buffer)
        ctx.body = {
            code: 200,
            data: 'OK'
        }
    })
    ```
- 问题二：账单分类和账单类型匹配？

账单分类和账单类型需要匹配，比如房贷就匹配支出，所以需要检验再写入文件

## 统计

过程：读取文件 -> 格式化数据 -> 月份和分类筛选 -> 统计数据

- 问题一：如何统计不同订单类型总数？对于没有明确分类的账单如何处理？

    ```
    /**
    * 
    * @param {Array} data 订单列表
    * @param {Object} body 请求体
    * @param {*} categoryMap 分类对象
    * @returns 统计列表
    */
    const statistics = (data, body, categoryMap) => {
        let { month, type = 0, category } = body
        type = type || 0
        let list = []
        let obj = {}
        for(let i = 0; i < data.length; i++) {
            if(month && (new Date(data[i].time).getMonth() + 1 != month)) { // 月份筛选
                continue
            }
            if(data[i].type != type) {
                continue
            }
            let key = categoryMap[data[i].category] ? data[i].category : 'other' // 无分类账单处理
            if(!obj.hasOwnProperty(data[i].category)) {
                obj[key] = 0
            }
            obj[key] += data[i].amount
        }
        
        Object.keys(obj).forEach(item => {
            let index = 0
            for(let i = 0; i < list.length; i++) {
                if(list[i].amount > obj[item]) { // 找到最合适位置插入
                    index = i + 1 // 光标右移动
                }
            }
            let cur = item != 'other' ? { ...categoryMap[item], amount: obj[item].toFixed(2)} : {id: 'other', type, name: '其它',  amount: obj[item].toFixed(2)} // 无分类账单处理
            list.splice(index, 0, cur)
        })
    
        return list
    }
    ````

    利用对象key值唯一型，对同类型的进行累加，对没有明确账单类型的统一设置为other，作为其它订单累加。

- 问题二：分类数据进行匹配如何最优化？

    将分类数据转化为对象，通过对象直接配匹配

- 问题三：如何排序减少遍历？

    遍历统计对象同时使用类是选择排序方式插入到数组对应位置

    ```
    Object.keys(obj).forEach(item => {
        let index = 0
        for(let i = 0; i < list.length; i++) {
            if(list[i].amount > obj[item]) { // 找到最合适位置插入
                index = i + 1 // 光标右移动
            }
        }
        let cur = item != 'other' ? { ...categoryMap[item], amount: obj[item].toFixed(2)} : {id: 'other', type, name: '其它',  amount: obj[item].toFixed(2)} // 无分类账单处理
        list.splice(index, 0, cur)
    })
    ```


项目其它问题：数据返回和异常处理可以进一步优化