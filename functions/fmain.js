
module.exports.sendJSONresponse = function sendJSONresponse(res, status, content) {
    console.log(status, content);
    res.status(status);
    res.json(content);
}
