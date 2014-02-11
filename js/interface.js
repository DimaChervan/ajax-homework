(function () {
    var sendBtn = document.getElementsByClassName('send')[0],
        inputLogin = document.getElementsByTagName('input')[0];
    sendBtn.addEventListener('click', function () {
        getUserData(inputLogin.value);
    });
    inputLogin.addEventListener('keypress', function (e) {
        var event = e || window.event;
        if (event.keyCode == 13) {
            getUserData(inputLogin.value);
        }
    });
})();
