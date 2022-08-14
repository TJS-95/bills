import { request } from 'umi'
import { message } from 'antd'
export const getBills = async (values: object) => {
    let res = await request('http://localhost:3000/api/bills', {
        method: 'post',
        data: values
    })
    return res && res.data
}

export const getCategory = async () => {
    let res = await request('http://localhost:3000/api/category', {
        method: 'get'
    })
    return res && res.data
}

export const createBill = async (values) => {
    let res = await request('http://localhost:3000/api/create', {
        method: 'post',
        data: values
    })
    return res && res.data
}

export const getStatistics = async (values) => {
    let res = await request('http://localhost:3000/api/statistics', {
        method: 'post',
        data: values
    })
    return res && res.data
}