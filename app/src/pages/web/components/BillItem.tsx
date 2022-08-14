import React from 'react'
import { BillProps } from 'umi'
import './index.less'

interface definedProps {
    item: BillProps,
    categoryMap: object,
    typeMap: object
}

export default function BillItem(props: definedProps) {
    const { item, categoryMap, typeMap } = props
    let { type, category, time, amount } = item
    return (
        <div className='bill-item'>
            <div className='left'>
                <div className="category">{ categoryMap[category] || '其它' }</div>
                <div className='time'>{new Date(time).toISOString()}</div>
            </div>
            <div className='right'>
                <div className="type">{typeMap[type]}</div>
                <div className="amount">{amount.toFixed(2)}</div>
            </div>
        </div>
    )
}
