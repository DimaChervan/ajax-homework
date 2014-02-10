var getUserData = (function(){
    var ajax = (function () {
        var error;
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

    var eventView = (function () {
        var popup = document.getElementsByClassName('error-message')[0];
        return function (message) {
            popup.innerHTML = message;
            popup.classList.remove('hide');
            setTimeout(function () {
                popup.classList.add('hide');
            }, 2000);
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
            separator = '///', loadEnd;
        function getUserData(responseObj){
            var responseItem, date;
            if (responseObj instanceof Array) {
                infoObj.repos = [];
                responseObj.forEach(function(item) {
                    infoObj.repos.push({
                        name : item.name,
                        url : item.clone_url
                    });
                });
            }
            else {
                Object.keys(infoObj).forEach(function (item) {
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
                infoObj.email.indexOf('Информация отсутствует') == 0 ? infoObj.email_url = '' : infoObj.email_url = ' href=mailto:' + infoObj.email;
            }
            logicLoaded ();
        }

        function logicLoaded () {
            if (loadEnd) {
                reView(infoObj);
                localStorage.setItem(infoObj.login.toLowerCase(), JSON.stringify(infoObj) + separator + (Date.parse(new Date()) + 6 * 1000 * 60 * 24));
                loadEnd = false;
                return;
            }
            loadEnd = true;
        }

        function searchCache (login) {
            if (localStorage[login]) {
                reView(JSON.parse(localStorage[login].slice(0, localStorage[login].indexOf(separator))));
                return true;
            }
            return false;
        }

        (function () {
            var storageItem,
                time = Date.parse(new Date());
            Object.keys(localStorage).forEach(function(item){
                storageItem = localStorage[item];
                if (storageItem.slice(storageItem.indexOf(separator) + separator.length, storageItem.length) <= time ) {
                    localStorage.removeItem(item);
                }
            });
        })();

        var reView = (function () {
            var wrap = document.getElementsByClassName('content-wrap')[0],
                template = document.getElementsByClassName('loDash-template-leftPath')[0];
            return function (obj) {
                wrap.classList.add('hide');
                wrap.innerHTML = _.template(template.innerHTML.trim(), {it: obj});
                wrap.classList.remove('hide');
            }
        })();

        return {
            send : function (login) {
                if (login.length > 0) {
                    if (!searchCache(login.toLowerCase())) {
                        request(login, getUserData);
                    }
                }
                else {
                    eventView('Введите логин');
                }
            }
        };
    })();

    return getInfo.send;
})();