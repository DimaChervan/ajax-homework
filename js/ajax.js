var getUserData = (function(){
    var viewData = (function () {
        var hideClassName = 'hide';
        var reViewUserData = (function () {
            var wrap = document.getElementsByClassName('content-wrap')[0],
                template = document.getElementsByClassName('loDash-template-leftPath')[0];
            return function (obj) {
                wrap.classList.add(hideClassName);
                wrap.innerHTML = _.template(template.innerHTML.trim(), {it: obj});
                wrap.classList.remove(hideClassName);
            }
        })();

        var eventView = (function () {
            var popup = document.getElementsByClassName('error-message')[0];
            return function (message) {
                popup.innerHTML = message;
                popup.classList.remove(hideClassName);
                setTimeout(function () {
                    popup.classList.add(hideClassName);
                }, 2000);
            }
        })();

        return {
            reViewUserData : reViewUserData,
            eventView : eventView
        }
    })();

    var ajax = (function () {
        var eventView = viewData.eventView,
            error;
        function newRequest (urlPath, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.github.com/users/' + urlPath);
            xhr.onreadystatechange = function () {
                if (xhr.readyState < 4) {
                    return;
                }
                if (xhr.status != 200) {
                    if (error) {
                        xhr.status == 404 ? eventView('Пользователь не найден') : eventView(xhr.status + ': ' + xhr.statusText);
                        error = false;
                        return;
                    }
                    error = true;
                    return;
                }
                callback(JSON.parse(xhr.responseText));
            };
            xhr.send();
        }

        return {
            findUserInfo : function (urlPath, callback) {
                newRequest(urlPath, callback);
                newRequest(urlPath + '/repos', callback);
            }
        }
    })();

    var getInfo = (function () {
        var infoObj = {
                login : '1',
                email : '1',
                followers : '1',
                following : '1',
                created_at : '1',
                avatar_url : '1',
                repos : '1',
                email_url : '1'
            },
            request = ajax.findUserInfo,
            loadEnd;
        function selectUserData(responseObj){
            var responseItem, date, email;
            if (responseObj instanceof Array) {
                infoObj.repos = [];
                _.forEach(responseObj, function(item) {
                    infoObj.repos.push({
                        name : item.name,
                        url : item.clone_url
                    });
                });
            }
            else {
                _.forEach(Object.keys(infoObj), function(item) {
                    if (item != 'repos') {
                        responseItem = responseObj[item];
                        if (!responseItem && responseItem === 0) {
                            infoObj[item] = 0;
                        }
                        else {
                            infoObj[item] = responseItem ? responseItem : 'Информация отсутствует';
                        }
                    }
                });
                date = new Date(responseObj['created_at']).toDateString();
                infoObj.created_at = date.slice(date.indexOf(' ') + 1, date.length);
                email = infoObj.email;
                email.indexOf('Информация отсутствует') == 0 ? infoObj.email_url = '' : infoObj.email_url = ' href=mailto:' + email;
            }
            logicLoaded ();
        }

        function logicLoaded () {
            if (loadEnd) {
                viewData.reViewUserData(infoObj);
                cacheData.saveInCache(infoObj);
                loadEnd = false;
                return;
            }
            loadEnd = true;
        }

        return {
            logicRequest : function (login) {
                if (login.length > 0) {
                    if (!cacheData.searchCache(login.toLowerCase())) {
                        request(login, selectUserData);
                    }
                }
                else {
                    viewData.eventView('Введите логин');
                }
            }
        };
    })();

    var cacheData = (function () {
        var separator = '///';
        (function () {
            var storageItem,
                time = Date.parse(new Date());
            _.forEach(Object.keys(localStorage), function(item){
                storageItem = localStorage[item];
                if (storageItem.slice(storageItem.indexOf(separator) + separator.length, storageItem.length) <= time ) {
                    localStorage.removeItem(item);
                }
            });
        })();

        function searchCache (login) {
            if (localStorage[login]) {
                viewData.reViewUserData(JSON.parse(localStorage[login].slice(0, localStorage[login].indexOf(separator))));
                return true;
            }
            return false;
        }

        function saveInCache (infoObj) {
            localStorage.setItem(infoObj.login.toLowerCase(), JSON.stringify(infoObj) + separator + (Date.parse(new Date()) + 6 * 1000 * 60 * 24));
        }

        return {
            searchCache : searchCache,
            saveInCache : saveInCache
        }
    })();

    return getInfo.logicRequest;
})();
