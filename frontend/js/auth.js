import { loginJson, registerJson } from './surveyConfig.js';
import { loadTodos } from './todos.js';
let currentSurvey = null;

function createSurvey(json) {
    const survey = new Survey.Model(json);
    
    survey.onComplete.add((sender, options) => {
        const formData = sender.data;
        const endpoint = json === loginJson ? '/v1/auth/login' : '/v1/auth/register';
        
        fetch('http://localhost:3000' + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (json === registerJson) {
                // Kayıt başarılı ise login formuna yönlendir
                alert("Kayıt başarılı! Lütfen giriş yapın.");
                showLogin();
                return;
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                // role kontrolü için me entpointine istek atılıyor
                fetch('http://localhost:3000/v1/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                })
                .then(response => response.json())
                .then(userData => {
                    localStorage.setItem('isAdmin', userData?.isAdmin || false);
                    showTodoContainer();
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                    alert('Error fetching user data');
                });
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
    });

    $("#surveyContainer").empty();
    $("#surveyContainer").Survey({ model: survey });
    currentSurvey = survey;
}

function showLogin() {
    document.getElementById('loginBtn').classList.add('active');
    document.getElementById('registerBtn').classList.remove('active');
    createSurvey(loginJson);
}

function showRegister() {
    document.getElementById('loginBtn').classList.remove('active');
    document.getElementById('registerBtn').classList.add('active');
    createSurvey(registerJson);
}

export function showAuthContainer() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('todoContainer').style.display = 'none';
    // jwt ve role bilgileri siliniyor
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    // datatable varsa onu kaldırıyoruz
    if ($.fn.DataTable.isDataTable('#todosTable')) {
        $('#todosTable').DataTable().destroy();
    }
    $("#surveyContainer").empty();
    showLogin();
}

function showTodoContainer() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('todoContainer').style.display = 'block';
    loadTodos();
}


document.addEventListener('DOMContentLoaded', function() {
    
    document.getElementById('loginBtn').addEventListener('click', showLogin);
    document.getElementById('registerBtn').addEventListener('click', showRegister);
    document.getElementById('logoutBtn').addEventListener('click', showAuthContainer);
    
    // login olmuş user varsa onu todo ya yönlendir yoksa login survey oluşsun
    if (localStorage.getItem('token')) {
        showTodoContainer();
    } else {
        showLogin();
    }
});
