import React, { useEffect, useState } from 'react'
import { LeftOutlined } from '@ant-design/icons';
import { connect } from 'umi';
import './index.less'
import DropSelect from '@/components/DropSelect';

// const common = {label: '全部', key: -1}
const months = [{label: '一月', key: 1}, {label: ' 二月', key: 2}, {label: '三月', key: 3}, {label: '四月', key: 4}, {label: '五月', key: 5},
    {label: '六月', key: 6}, {label: '七月', key: 7}, {label: '八月', key: 8}, {label: '九月', key: 9}, {label: '十月', key: 10}, 
    {label: '十一月', key: 11}, {label: '十二月', key: 12}
]

function Statistics({ location, history, dispatch }) {
    const [month, setMonth] = useState('')
    const [list, setList] = useState([])
    const setFilters = (data) => {
        setMonth(data.month)
    }
    useEffect(() => {
        let m = location.query.month
        setMonth(m)
    }, [])
    useEffect(() => {
        getData() 
    }, [month])

    const goBack = () => {
        history.push({
            pathname: '/'
        })
    }
    const getData = () => {
        if(!month) return
        dispatch({
            type: 'bills/statistics',
            payload: {month}
        }).then(res => {
            setList(res)
        })
    }
    return (
        <>
            <div className="header flex-justify">
                <LeftOutlined  onClick={goBack} />
                <DropSelect change={setFilters} items={months} field='month' name='月份' value={month}></DropSelect>
            </div>
            <div className="list">
                { list.length ? list.map(item => (
                    <div className="list-item flex-justify">
                        <div className="title">{item.name}</div>
                        <div className="count">¥{item.amount}</div>
                    </div>
                )): <div className="empty">暂无数据</div> }
            </div>
        </>
    )
}

const mapStateToProps = ({bills}) => ({
    bills
})
  
export default connect(mapStateToProps)(Statistics);