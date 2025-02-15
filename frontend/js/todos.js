import { todoAddJson } from './surveyConfig.js';
import { showAuthContainer } from './auth.js';

let todosTable;

function initDataTable() {
    if ($.fn.DataTable.isDataTable('#todosTable')) {
        todosTable = $('#todosTable').DataTable();
        return;
    }

    todosTable = $('#todosTable').DataTable({
        columns: [
            { data: 'title' },
            { 
                data: 'categories',
                render: (data) => {
                    if (!data || data.length === 0) {
                        return '';
                    }
                    let categoriesHtml = data.map(category => {
                        return `<span class="badge bg-info">${category.title}</span>`;
                    }).join(', ');
                    return categoriesHtml;
                }
            },
            { 
                data: 'completed',
                render: (data) => {
                    return data ? 
                        '<span class="badge bg-success">Completed</span>' : 
                        '<span class="badge bg-warning">Pending</span>';
                }
            },
            {
                data: null,
                render: (data) => {
                    return `
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-success toggle-status" data-id="${data._id}" data-completed="${data.completed}">
                                ${data.completed ? 'Undo' : 'Complete'}
                            </button>
                            <button class="btn btn-sm btn-warning update-todo" data-id="${data._id}" data-title="${data.title}">
                                Update
                            </button>
                            <button class="btn btn-sm btn-danger delete-todo" data-id="${data._id}">
                                Delete
                            </button>
                        </div>
                    `;
                }
            }
        ],
        responsive: true,
        language: {
            emptyTable: "No todos found"
        }
    });

    // dynamic oluşan butonlara event atadık
    $('#todosTable').on('click', '.toggle-status', function() {
        const todoId = $(this).data('id');
        const completed = $(this).data('completed');
        changeTodoStatus(todoId, !completed);
    });

    $('#todosTable').on('click', '.delete-todo', function() {
        const todoId = $(this).data('id');
        deleteTodo(todoId);
    });

    $('#todosTable').on('click', '.update-todo', function() {
        const todoId = $(this).data('id');
        const currentTitle = $(this).data('title');
        showUpdateTodoModal(todoId, currentTitle);
    });
}

export const loadTodos = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showAuthContainer();
        return;
    }

    fetch('http://localhost:3000/v1/todos', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(todos => {
        if (!todosTable) {
            initDataTable();
        }
        todosTable.clear().rows.add(todos).draw();
    })
    .catch(error => {
        if (error.message === 'Failed to fetch todos') {
            showAuthContainer();
        }
    });
}

const changeTodoStatus = (todoId, completed) => {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:3000/v1/todos/${todoId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed })
    })
    .then(() => loadTodos())
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating todo status');
    });
}

const deleteTodo = (todoId) => {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:3000/v1/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(() => loadTodos())
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting todo');
    });
}

const addTodo = () => {
    const survey = new Survey.Model(todoAddJson);
    
    survey.onComplete.add((sender, options) => {
        const token = localStorage.getItem('token');
        const formData = sender.data;
        
        fetch('http://localhost:3000/v1/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: formData.title })
        })
        .then(data => {
            if (data._id) {
                loadTodos(); // yeni bir todo eklendiğinde tabloyu yenile
                $("#todoSurveyContainer").empty();
                bootstrap.Modal.getInstance(document.getElementById('addTodoModal')).hide();
            } else {
                alert(data.message || 'An error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the todo');
        });
    });

    $("#todoSurveyContainer").empty();
    $("#todoSurveyContainer").Survey({ model: survey });
    new bootstrap.Modal(document.getElementById('addTodoModal')).show();
}

const showUpdateTodoModal = (todoId, currentTitle) => {
    const survey = new Survey.Model(todoAddJson);
    survey.data = { title: currentTitle };
    
    survey.onComplete.add((sender, options) => {
        const token = localStorage.getItem('token');
        const formData = sender.data;
        
        fetch(`http://localhost:3000/v1/todos/${todoId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: formData.title })
        })
        .then(response => response.json())
        .then(data => {
            if (data._id) {
                loadTodos(); 
                $("#updateTodoSurveyContainer").empty(); 
                bootstrap.Modal.getInstance(document.getElementById('updateTodoModal')).hide(); 
            } else {
                alert(data.message || 'An error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the todo');
        });
    });

    $("#updateTodoSurveyContainer").empty();
    $("#updateTodoSurveyContainer").Survey({ model: survey });
    new bootstrap.Modal(document.getElementById('updateTodoModal')).show();
}

document.addEventListener('DOMContentLoaded', function() {
    //HTML ve DOM yüklendikten sonra datalar yükleniyor
    initDataTable();
    
    // addTodoBtn idli butona click eventi ekledik
    document.getElementById('addTodoBtn').addEventListener('click', addTodo);
});
