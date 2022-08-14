const Validator = require('validator');

const isEmpty = (value) => {
    return (
        !value ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'sttring' && value.trim().length === 0)
    )
} 

function ListValidator(body) {
    let { type, category, amount } = body
    type = isEmpty(type) ? '' : type
    category = isEmpty(category) ? '' : category
    amount = isEmpty(amount) ? '' : amount
    const err = {}

    if(Validator.isEmpty(type + '')) {
        err.type = '账单类型不能为空'
        if(Validator.isInt(type)) {
            err.type = '账单类型为Int'
        }
    }
    
    if(Validator.isEmpty(category)) {
        err.category = '账单分类不能为空'
    }
    if(Validator.isEmpty(amount + '')) {
        err.amount = '账单金额不能为空'
        if(Validator.isFloat(amount)) {
            err.amount = '账单金额类型为float'
        }
    }

    return {
        err,
        isValid: isEmpty(err)
    }
}
  
module.exports = {
    ListValidator
}