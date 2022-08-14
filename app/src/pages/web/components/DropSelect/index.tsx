import React, { useState } from 'react'
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Space } from 'antd';
import './dropSelect.less'

interface definedProps {
    change: Function,
    items: Array<Object>,
    name: String,
    value: String
}

export default function DropSelect(props: definedProps) {
    let { change, name, value, items } = props
    const handleMonth = (key: string) => {
        let cur = items.find(item => (item.key+'') == key)
        if(key != '-1') {
            setLabel(cur.label)
            change({[value]: cur.key})
        } else {
            setLabel(name)
            change({[value]: ''})
        }
    }
    const [label, setLabel] = useState(name)
    const menu = (
        <Menu items={items} onClick={ ({key}) => handleMonth(key)}/>
    )
    return (
        <Dropdown overlay={menu} trigger={['click']} className="drop-select">
            <a onClick={e => e.preventDefault()}>
            <Space>
                {label}
                <DownOutlined />
            </Space>
            </a>
        </Dropdown>
    )
}
