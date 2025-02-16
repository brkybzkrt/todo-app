import { categoryAddJson, categoryUpdateJson } from './surveyConfig.js';

let adminCategoriesTable;

export function initAdminCategoriesTable() {
    const token = localStorage.getItem('token');

    if (adminCategoriesTable) {
        adminCategoriesTable.destroy();
        adminCategoriesTable = null;
    }
    $('#adminCategoriesTable').off();

    fetch('http://localhost:3000/v1/categories', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(categories => {
        adminCategoriesTable = $('#adminCategoriesTable').DataTable({
            data: categories,
            destroy: true,
            columns: [
                { 
                    data: 'title',
                    title: 'Title'
                },
                {
                    data: 'createdAt',
                    title: 'Created At',
                    render: (data) => {
                        return new Date(data).toLocaleDateString();
                    }
                },
                {
                    data: null,
                    title: 'Actions',
                    render: (data) => {
                        return `
                            <div class="action-buttons">
                                <button class="btn btn-sm btn-warning update-category" 
                                    data-id="${data._id}" 
                                    data-title="${data.title}">
                                    Update
                                </button>
                                <button class="btn btn-sm btn-danger delete-category" data-id="${data._id}">
                                    Delete
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            responsive: true,
            language: {
                emptyTable: "No categories found"
            },
            order: [[0, 'desc']]
        });

        // Event handlers for category actions
        $('#adminCategoriesTable').on('click', '.delete-category', function() {
            const categoryId = $(this).data('id');
            if (confirm('Are you sure you want to delete this category?')) {
                deleteCategory(categoryId);
            }
        });

        $('#adminCategoriesTable').on('click', '.update-category', function() {
            const categoryId = $(this).data('id');
            const currentTitle = $(this).data('title');
            showUpdateCategoryModal(categoryId, currentTitle);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error loading categories');
    });
}

export const deleteCategory = (categoryId) => {
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:1880/delete-category/${categoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(() => {
        initAdminCategoriesTable();
        // Todo listesini de güncelle çünkü silinen kategoriye ait todolar olabilir
        window.dispatchEvent(new CustomEvent('categoryChanged'));
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting category');
    });
}

export const addCategory = () => {
    const survey = new Survey.Model(categoryAddJson);
    
    survey.onComplete.add((sender, options) => {
        const token = localStorage.getItem('token');
        const formData = sender.data;
        
        fetch('http://localhost:1880/create-category', {
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
                initAdminCategoriesTable();
                $("#categorySurveyContainer").empty();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
                modal.hide();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open');
                // Todo listesini güncelle çünkü yeni kategori eklenmiş olabilir
                window.dispatchEvent(new CustomEvent('categoryChanged'));
            } else {
                alert(data.message || 'An error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while adding the category');
        });
    });

    $("#categorySurveyContainer").empty();
    $("#categorySurveyContainer").Survey({ model: survey });
    new bootstrap.Modal(document.getElementById('addCategoryModal')).show();
}

export const showUpdateCategoryModal = (categoryId, currentTitle) => {
    const survey = new Survey.Model(categoryUpdateJson);
    
    survey.data = {
        title: currentTitle
    };
    
    survey.onComplete.add((sender, options) => {
        const token = localStorage.getItem('token');
        const formData = sender.data;
        fetch(`http://localhost:1880/update-category/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: formData.title })
        })
        .then(response => response.json())
        .then(data => {
            if (data._id) {
                initAdminCategoriesTable();
                $("#updateCategorySurveyContainer").empty();
                const modal = bootstrap.Modal.getInstance(document.getElementById('updateCategoryModal'));
                modal.hide();
                $('.modal-backdrop').remove();
                $('body').removeClass('modal-open');
                // Todo listesini güncelle çünkü kategori ismi değişmiş olabilir
                window.dispatchEvent(new CustomEvent('categoryChanged'));
            } else {
                alert(data.message || 'An error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the category');
        });
    });

    $("#updateCategorySurveyContainer").empty();
    $("#updateCategorySurveyContainer").Survey({ model: survey });
    new bootstrap.Modal(document.getElementById('updateCategoryModal')).show();
}
