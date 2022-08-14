import React, { useEffect, useState } from 'react'
import { Button } from 'antd';
import './index.less'
import { connect, Link } from 'umi';
import { BillProps } from './model'
import BillItem from './components/BillItem';
import DropSelect from '@/components/DropSelect';
import { BillModal } from './components/BillModel';

const common = {label: '全部', key: -1}
const types = [ common, {label: '支出', key: 0}, {label: '收入', key: 1}]
const months = [common, {label: '一月', key: 1}, {label: ' 二月', key: 2}, {label: '三月', key: 3}, {label: '四月', key: 4}, {label: '五月', key: 5},
    {label: '六月', key: 6}, {label: '七月', key: 7}, {label: '八月', key: 8}, {label: '九月', key: 9}, {label: '十月', key: 10}, 
    {label: '十一月', key: 11}, {label: '十二月', key: 12}
]

const Web = ({ bills, dispatch }) => {
  const { data = [], expenditure, income } = bills
  const [categories, setCategories] = useState([])
  const [categoryMap, setCategoryMap] = useState({})
  const [categoryMenus, setCategoryMenus] = useState([])
  const [params, setParams] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [typeMap] = useState({
    0: '支出',
    1: '收入'
  })
  useEffect(() => {
    let data = dispatch({
      type: 'bills/getCategories'
    }).then((res: []) => {
      setCategories(res)
      let map = toMap(res, 'id', 'name')
      let menus = res.map(item => ({
        label: item.name,
        key: item.id
      }))
      setCategoryMenus([common, ...menus])
      setCategoryMap(map)
    })
    
  }, [])

  const toMap = (data: Object[], key: string, value: string) => {
    if(!Array.isArray(data)) return {}
    let obj = {}
    data.forEach(item => {
        obj[item[key]] = item[value]
    })
    return obj
  }

  const setFilters = (data) => {
    let parm = {...params, ...data}
    setParams(parm)
    dispatch({
      type: 'bills/getRemote',
      payload: parm
    })
  }

  const onFinish = (data) => {
    dispatch({
      type: 'bills/create',
      payload: data
    })
    setModalVisible(false)
  }

  return (
    <div className='card-wrap'>
      <div className="bill-header">
        <div className="flex-justify">
          <div>
            <DropSelect change={setFilters} items={categoryMenus} field='category' name='账单分类'></DropSelect>
            <DropSelect change={setFilters} items={types} field='type' name='账单类型'></DropSelect>
          </div>
          <div>
            <Link className='pr-10' to={`/statistics?month=${params.month}`}>统计</Link>
            <Button size='small' shape='round' type='primary' onClick={() => setModalVisible(true)}>新建账单</Button>
          </div>
        </div>
        <div className="flex-justify">
          <DropSelect change={setFilters} items={months} field='month' name='月份'></DropSelect>
          <div className="statistics">
            <div className="sum">支出：¥{expenditure}</div>
            <div className="sum">收入：¥{income}</div>
          </div>
        </div>
      </div>
      <div className='bill-list'>
        {
          data.length ? data.map((item: BillProps) => <BillItem item={item} categoryMap={categoryMap} typeMap={typeMap}/>) : <div className="empty">暂无数据</div>
        }
      </div>
      <BillModal visible={modalVisible} setModalVisible={setModalVisible} onFinish={onFinish} types={typeMap} categorires={categories}></BillModal>
    </div>
  )
}
const mapStateToProps = ({bills}) => ({
  bills
})

export default connect(mapStateToProps)(Web);