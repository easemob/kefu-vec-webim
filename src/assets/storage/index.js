var memeryStorage = {};
var localStorage;
var getItem = function (key) {
	return memeryStorage[key];
};
var setItem = function (key, val) {
	memeryStorage[key] = val;
};
var removeItem = function (key) {
	memeryStorage[key] = null;
	delete memeryStorage[key];
};

function removeAll() {
	localStorage.clear();
	window.location.reload();
}
try {
	localStorage = window.localStorage;
}
catch (e) {
}
if (localStorage) {
	getItem = function (key) {
		return localStorage.getItem(key);
	};
	setItem = function (key, value) {
		try {
			return localStorage.setItem(key, value);
		}
		catch (err) {
			LayerAlert.content(
				app.t("layout.common.localstorage_content")
			).confirm(function () {
				removeAll();
			}).cancel(function () {
				removeAll();
			}).show({
				confirmTxt: app.t("layout.common.clear_immediately")
			});
		}
		return false;
	};
	removeItem = function (key) {
		return localStorage.removeItem(key);
	};
}

export const setVisitorInfo = (tenantId, info) => {
    setItem(`reserve_visitor_${tenantId}`, info)
}

export const getVisitorInfo = tenantId => {
    return JSON.parse(getItem(`reserve_visitor_${tenantId}`))
}
