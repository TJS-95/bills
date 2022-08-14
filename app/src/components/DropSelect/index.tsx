import React, { useEffect, useState } from 'react'
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Space } from 'antd';
import './dropSelect.less'

interface definedProps {
    change: Function,
    items: Array<Object>,
    name: String,
    field: String,
    value?: String
}

export default function DropSelect(props: definedProps) {
    let { change, name, field, items, value } = props
    const handleMonth = (key: string) => {
        let cur = items.find(item => (item.key+'') == key)
        if(key != '-1') {
            setLabel(cur.label)
            change({[field]: cur.key})
        } else {
            setLabel(name)
            change({[field]: ''})
        }
    }
    const [label, setLabel] = useState(name)
    
    useEffect(() => {
        let cur = items.find(item => item.key == +value)
        cur && setLabel(cur.label)
    }, [value])

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
