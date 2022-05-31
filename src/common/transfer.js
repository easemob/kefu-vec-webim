var Transfer = require("@/pages/plugin/common/transfer");
import queryString from 'query-string'

var iframeId = queryString.parse(location.search).iframeId || null
var transfer = new Transfer(iframeId, "toHost", true);
transfer.to = iframeId

export default transfer
