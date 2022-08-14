const KoaRouter = require('koa-router')
const path = require('path')
const fs = require('fs')
const { ListValidator } = require('../validators/validator')
const { HttpException }= require('../core/http-exception')

let categoryMap = {}

const router = new KoaRouter({
    prefix: '/api'
})

/**
 * 获取分类
 * @returns 数组对象
 */
const getCategories = async () => {
    let filePath = path.resolve(__dirname, '../static/categories.csv')
    const buffer = fs.readFileSync(filePath, 'utf8')
    return await CsvToJson(buffer)
}

/**
 * 对象转map
 * @param {object} data 对象
 * @param {string} key map key
 * @returns object
 */
const toMap = (data, key) => {
    if(!Array.isArray(data)) return {}
    let obj = {}
    data.forEach(item => {
        obj[item[key]] = item
    })
    return obj
}

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

/**
 * 
 * @param {Array} data 数据
 * @param {object} body 请求参数
 * @returns 筛选返回列表
 */
const filterBills = (data, body) => {
    let { month, type, category } = body
    let list = []
    let expenditure = 0
    let income = 0
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

// 获取分类
router.get('/category', async (ctx) => {
    let res = await getCategories()
    ctx.body = {
        code: 200,
        data: res
    }
})

// 获取账单
router.post('/bills', async (ctx) => {
    let filePath = path.resolve(__dirname, '../static/bill.csv')
    const buffer = fs.readFileSync(filePath, 'utf8')
    if(JSON.stringify(categoryMap) === '{}') {
        let categories = await getCategories()
        categoryMap = toMap(categories, 'id')
    }
    let res = await CsvToJson(buffer)
    
    ctx.body = {
        code: 200,
        data: filterBills(res, ctx.request.body)
    }
})

// 新建账单
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

// 统计
router.post('/statistics', async (ctx) => {
    let filePath = path.resolve(__dirname, '../static/bill.csv')
    const buffer = fs.readFileSync(filePath, 'utf8')
    let categories = await getCategories()
    categoryMap = toMap(categories, 'id')
    let res = await CsvToJson(buffer)
    
    ctx.body = {
        code: 200,
        data: statistics(res, ctx.request.body, categoryMap)
    }
})

module.exports = router