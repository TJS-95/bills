import { Modal, Form, Input, Select } from 'antd';
const { Option } = Select
import React, { useEffect } from 'react';

interface definedProps {
    visible: boolean,
    setModalVisible: Function,
    onFinish: Function,
    types: Object,
    categorires: Array<Object>
}
export const BillModal = (props: definedProps) => {
    const [form] = Form.useForm()
    const { visible, setModalVisible, onFinish, types, categorires } = props

    useEffect(() => {
        form.resetFields()
    },[visible])
    const handleOk = () => {
        form.submit()
    }
    const handleCancel = () => {
        setModalVisible(false)
    }
    const onFinishFailed = errorInfo => {
        console.log(errorInfo)
    }
    const changeType = (e) => {
        form.setFieldsValue({category: ''})
    }
    const onChange = (e) => {
        let cur = categorires.find(item => item.id === e)
        form.setFieldsValue({type: cur.type + ''})
    }
    return (
        <Modal title="新建账单" forceRender visible={visible} onOk={handleOk} onCancel={handleCancel}>
           <Form
                name="basic"
                labelCol={{ span: 8 }}
                form={form}
                autoComplete="off"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                >
                <Form.Item
                    label="账单类型"
                    name="type"
                    rules={[{ required: true, message: 'Please input your type!' }]}
                    >
                    <Select onChange={changeType}>
                        {Object.keys(types).map(key => <Option value={key}>{types[key]}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="账单分类"
                    name="category"
                    
                    >
                    <Select onChange={onChange}>
                        {categorires.map(item => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="账单金额"
                    name="amount"
                    rules={[{ required: true, message: 'Please input your amount!' }]}
                    >
                    <Input type='number' />
                </Form.Item>
            </Form>
        </Modal>
    );
}