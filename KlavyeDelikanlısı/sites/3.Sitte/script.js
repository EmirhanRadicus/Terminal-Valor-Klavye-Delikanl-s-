const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const tcInput = document.getElementById('tc').value;
        const passwordInput = document.getElementById('password').value;

        const dogruTC = "11111111111";
        const dogruSifre = "1234";

        if (tcInput === dogruTC && passwordInput === dogruSifre) {
            window.location.href = "hesap.html";
        } else {
            alert("Hatalı T.C. Kimlik No veya Şifre! Lütfen tekrar deneyin.\n(Test için T.C: 11111111111, Şifre: 1234 kullanın)");
        }
    });
}