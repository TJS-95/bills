class HttpException extends Error {
    constructor(msg = '服务器异常', err, errorCode = 1000, code = 400) {
        super();
        this.msg = msg;
        this.err = err;
        this.code = code;
        this.errorCode = errorCode;
    }
}
module.exports = {HttpException}