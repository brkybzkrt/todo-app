import { todoAddJson, todoUpdateJson } from './surveyConfig.js';
import { showAuthContainer } from './auth.js';
import { initAdminCategoriesTable, addCategory } from './categories.js';

// Socket.io bağlantısı
const socket = io('http://localhost:3000');

let userTodosTable;
let adminTodosTable;

// Socket event listener'ı - yeni todo eklendiğinde
socket.on('todoCreated', (todo) => {
    if (adminTodosTable) {
        const data = adminTodosTable.data().toArray();
        data.unshift(todo); // Yeni todoyu başa ekle
        adminTodosTable.clear().rows.add(data).draw();
    }
});

// Socket event listener'ı - todo silindiğinde
socket.on('todoDeleted', (todoId) => {
    if (adminTodosTable) {
        // Silinen todo'yu tablodan kaldır
        adminTodosTable.rows((idx, data) => {
            return data._id === todoId;
        }).remove().draw();
    }
});

// Socket event listener'ı - todo güncellendiğinde
socket.on('todoUpdated', (updatedTodo) => {
    if (adminTodosTable) {
        // Güncellenen todo'nun indeksini bul
        const rowIndex = adminTodosTable.rows((_, data) => {
            return data._id === updatedTodo._id;
        }).indexes()[0];

        if (rowIndex !== undefined) {
            // Todo'yu güncelle
            adminTodosTable.row(rowIndex).data(updatedTodo).draw();
        }
    }
});

function initUserTable(todos) {
    if (userTodosTable) {
        userTodosTable.destroy();
        userTodosTable = null;
    }
    $('#userTodosTable').off();

    userTodosTable = $('#userTodosTable').DataTable({
        data: todos,
        destroy: true, // Tabloyu yeniden başlatmaya izin ver
        columns: [
            { 
                data: 'title',
                title: 'Title'
            },
            { 
                data: 'categories',
                title: 'Categories',
                render: (data) => {
                    if (!data || data.length === 0) {
                        return '';
                    }
                    return data.map(category => 
                        `<span class="badge bg-info">${category.title}</span>`
                    ).join(' ');
                }
            },
            { 
                data: 'completed',
                title: 'Status',
                render: (data) => {
                    return data ? 
                        '<span class="badge bg-success">Completed</span>' : 
                        '<span class="badge bg-warning">Pending</span>';
                }
            },
            {
                data: null,
                title: 'Actions',
                render: (data) => {
                    return `
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-success toggle-status" data-id="${data._id}" data-completed="${data.completed}">
                                ${data.completed ? 'Undo' : 'Complete'}
                            </button>
                            <button class="btn btn-sm btn-warning update-todo" 
                                data-id="${data._id}" 
                                data-title="${data.title}"
                                data-categories='${JSON.stringify(data.categories)}'>
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
        },
        order: [[0, 'desc']]
    });

    $('#userTodosTable').on('click', '.toggle-status', function() {
        const todoId = $(this).data('id');
        const completed = $(this).data('completed');
        changeTodoStatus(todoId, !completed);
    });

    $('#userTodosTable').on('click', '.delete-todo', function() {
        const todoId = $(this).data('id');
        if (confirm('Are you sure you want to delete this todo?')) {
            deleteTodo(todoId);
        }
    });

    $('#userTodosTable').on('click', '.update-todo', function() {
        const todoId = $(this).data('id');
        const currentTitle = $(this).data('title');
        const currentCategories = $(this).data('categories');
        showUpdateTodoModal(todoId, currentTitle, currentCategories);
    });
}

function initAdminTable(todos) {
    if (adminTodosTable) {
        adminTodosTable.destroy();
        adminTodosTable = null;
    }
    $('#adminTodosTable').off();

    adminTodosTable = $('#adminTodosTable').DataTable({
        data: todos,
        destroy: true,
        columns: [
            { 
                data: 'title',
                title: 'Title'
            },
            {
                data: 'user',
                title: 'User',
                render: (data) => {
                    return data ? `<span class="badge bg-primary">${data.username}</span>` : '';
                }
            },
            { 
                data: 'categories',
                title: 'Categories',
                render: (data) => {
                    if (!data || data.length === 0) {
                        return '';
                    }
                    return data.map(category => 
                        `<span class="badge bg-info">${category.title}</span>`
                    ).join(' ');
                }
            },
            { 
                data: 'completed',
                title: 'Status',
                render: (data) => {
                    return data ? 
                        '<span class="badge bg-success">Completed</span>' : 
                        '<span class="badge bg-warning">Pending</span>';
                }
            }
        ],
        responsive: true,
        language: {
            emptyTable: "No todos found"
        },
        order: [[0, 'desc']]
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
        .then(response => response.json())
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

const showUpdateTodoModal = async (todoId, currentTitle, currentCategories) => {
    const token = localStorage.getItem('token');
    
    try {

        const categoriesResponse = await fetch('http://localhost:3000/v1/categories', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const categories = await categoriesResponse.json();

        const surveyJson = JSON.parse(JSON.stringify(todoUpdateJson));

        const categoryElement = surveyJson.elements.find(e => e.name === 'categories');
        if (categoryElement) {
            categoryElement.choices = categories.map(cat => ({
                value: cat._id,
                text: cat.title
            }));
        }

        const survey = new Survey.Model(surveyJson);

        survey.data = {
            title: currentTitle,
            categories: currentCategories.map(cat => cat._id)
        };
        
        survey.onComplete.add((sender, options) => {
            const formData = sender.data;
            console.log(formData,"formData");
            
            fetch(`http://localhost:3000/v1/todos/${todoId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    categories: formData.categories || []
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data._id) {
                    loadTodos();
                    $("#updateTodoSurveyContainer").empty();
                    bootstrap.Modal.getInstance(document.getElementById('updateTodoModal')).hide();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                alert(error.message);
            });
        });

        $("#updateTodoSurveyContainer").empty();
        $("#updateTodoSurveyContainer").Survey({ model: survey });
        new bootstrap.Modal(document.getElementById('updateTodoModal')).show();
    } catch (error) {
        alert(error.message);
    }
}

export const loadTodos = () => {
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!token) {
        showAuthContainer();
        return;
    }

    // containerların role göre görünümünü ayarlama
    document.getElementById('userTableContainer').style.display = isAdmin ? 'none' : 'block';
    document.getElementById('adminTablesContainer').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('addTodoBtn').style.display = isAdmin ? 'none' : 'block';

    const titleElement = document.querySelector('.content-header h1');
    if (titleElement) {
        titleElement.textContent = isAdmin ? 'Admin Dashboard' : 'My Todos';
    }

    if (isAdmin) {
        initAdminCategoriesTable();
        fetch('http://localhost:3000/v1/todos/all', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch todos');
            return response.json();
        })
        .then(todos => initAdminTable(todos))
        .catch(error => {
            console.error('Error:', error);
            if (error.message === 'Failed to fetch todos') {
                showAuthContainer();
            }
        });
    } else {
        fetch('http://localhost:3000/v1/todos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch todos');
            return response.json();
        })
        .then(todos => initUserTable(todos))
        .catch(error => {
            console.error('Error:', error);
            if (error.message === 'Failed to fetch todos') {
                showAuthContainer();
            }
        });
    }
}

// Kategori değişikliklerini dinle
window.addEventListener('categoryChanged', () => {
    loadTodos();
});

document.addEventListener('DOMContentLoaded', function() {
    loadTodos();
    
    document.getElementById('addTodoBtn').addEventListener('click', addTodo);
    document.getElementById('addCategoryBtn')?.addEventListener('click', addCategory);
});
