import { getBills, editRecord, getCategory, createBill, getStatistics } from './service';
import { Effect, ImmerReducer, Reducer, Subscription } from 'umi';

export interface BillProps {
  type: Number,
  category: String,
  time: Number,
  amount: Number
}

export interface BillModelType {
  namespace: 'bills';
  state: {};
  effects: { 
    getRemote: Effect,
    getCategories: Effect,
    create: Effect,
    statistics: Effect
  };
  reducers: {
    getList: Reducer,
    getCate: Reducer
  };
  subscriptions: { setup: Subscription }
}

const BillModel: BillModelType = {
  namespace: 'bills',
  state: {},
  effects: {
    *getRemote({ payload }, { call, put }) {
      const data = yield call(getBills, payload)
      yield put({
        type: 'getList',
        payload: data
      })
    },
    *getCategories({ payload }, { call, put }) {
      const data = yield call(getCategory, payload)
      return data
    },
    *create({ payload }, { call, put }) { 
      const data =  yield call(createBill, payload)
      if(!data) return
      yield put({
        type: 'getRemote'
      })
    },
    *statistics({ payload }, { call, put }) {
      const data =  yield call(getStatistics, payload)
      return data
    }
  },
  reducers: {
    getList(state, { payload }) {
      return payload
    },
    getCate(state, {payload}) {
      return payload
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          dispatch({
            type: 'getRemote',
          })
        }
      })
    },
  },
}

export default BillModel
