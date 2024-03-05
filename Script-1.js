// ==UserScript==
// @name         Project BetterIG
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Better IG - Script 1 - Favorite Users List
// @author       By @iblindkiller [GitHub], All rights reserved. 
// @match        https://www.instagram.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    let popup = null;
    let favoritesList = null;
    let favorites = [];

    const styles = `
        #favorites-popup {
            position: fixed;
            left: 1445px; /* Set X coordinate */
            top: 619px; /* Set Y coordinate */
            background: linear-gradient(135deg, #8e2de2, #4a00e0); /* Gradient background */
            color: #fff; /* Lighter text color */
            border: none; /* Remove border */
            padding: 10px;
            max-height: 300px;
            overflow-y: auto;
        }
        .favorites-header {
            text-align: center;
            margin-bottom: 10px;
        }
        .favorites-header h2 {
            margin: 0;
            padding: 0;
        }
        .form-group {
            margin-bottom: 10px;
        }
        .form-group label {
            color: #000; /* Set label text color to black */
        }
        .form-group input[type="text"] {
            color: #000; /* Set input text color to black */
            border: none; /* Remove border */
            width: 100%; /* Set width to 100% */
            padding: 5px;
        }
        .btn {
            background-color: #4CAF50;
            color: white;
            padding: 8px 20px;
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            background-color: #45a049;
        }
        .favorites-list {
            list-style-type: none; /* Remove default bullet point */
            padding: 0;
            margin: 0;
        }
        .favorite-item {
            margin-bottom: 5px;
            position: relative;
        }
        .favorite-item .favorite-star {
            color: gold; /* Set color to golden */
            margin-right: 5px;
        }
        .favorite-item .settings-btn {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            background: transparent;
            border: none;
            color: #fff;
            font-size: 16px;
            padding: 0;
        }
        .favorite-item .settings-btn:focus {
            outline: none;
        }
        .favorite-item .settings-menu {
            display: none;
            position: absolute;
            top: calc(100% + 5px);
            right: 0;
            background-color: #333;
            border-radius: 5px;
            padding: 5px;
            z-index: 1;
        }
        .favorite-item .settings-menu button {
            background: transparent;
            border: none;
            color: #fff;
            cursor: pointer;
            padding: 5px;
            display: block;
            width: 100%;
            text-align: left;
        }
        .favorite-item:hover .settings-menu {
            display: block;
        }
        .description {
            display: -webkit-box;
            -webkit-line-clamp: 2; /* Limit to two lines */
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .separator {
            margin-bottom: 10px;
            border-bottom: 1px solid #fff;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    function createFavoritesManager() {
        if (document.getElementById('favorites-popup')) return;

        popup = document.createElement('div');
        popup.id = 'favorites-popup';
        popup.classList.add('favorites-popup');
        popup.innerHTML = `
            <div class="favorites-header">
                <h2>Favorite Users</h2>
            </div>
            <ul class="favorites-list"></ul>
            <div class="separator"></div>
            <div class="favorites-header">
                <h2>Add Users</h2>
            </div>
            <form id="add-favorite-form">
                <div class="form-group">
                    <label for="person-name">Name:</label>
                    <input type="text" id="person-name" required>
                </div>
                <div class="form-group">
                    <label for="person-link">Link:</label>
                    <input type="text" id="person-link" required>
                </div>
                <div class="form-group">
                    <label for="person-description">Description:</label>
                    <input type="text" id="person-description">
                </div>
                <button type="submit" class="btn btn-primary">Add User</button>
            </form>
        `;

        document.body.appendChild(popup);

        favorites = GM_getValue('favoritePeople', []);

        favoritesList = document.querySelector('.favorites-list');
        renderFavoritesList();

        const addFavoriteForm = document.getElementById('add-favorite-form');
        addFavoriteForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const nameInput = document.getElementById('person-name');
            const linkInput = document.getElementById('person-link');
            const descriptionInput = document.getElementById('person-description');
            const name = nameInput.value.trim();
            const link = linkInput.value.trim();
            const description = descriptionInput.value.trim();

            if (name && link) {
                favorites.push({ name, link, description });
                GM_setValue('favoritePeople', favorites);

                nameInput.value = '';
                linkInput.value = '';
                descriptionInput.value = '';

                renderFavoritesList();
            }
        });
    }

    function renderFavoritesList() {
        favoritesList.innerHTML = '';
        favorites.forEach((person, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'favorite-item';

            listItem.innerHTML = `
                <span class="favorite-star">&#9733;</span>
                <a href="${person.link}" target="_blank">${person.name}</a>
                <button class="settings-btn">⚙️</button>
                <div class="settings-menu">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
                ${person.description ? `<div class="description">${person.description}</div>` : ''}
            `;

            const editBtn = listItem.querySelector('.edit-btn');
            editBtn.addEventListener('click', function() {
                showEditModal(person, index);
            });

            const deleteBtn = listItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                deleteFavorite(index);
            });

            favoritesList.appendChild(listItem);
        });
    }

    function showEditModal(person, index) {
        const name = prompt('Enter new name:', person.name);
        const link = prompt('Enter new link:', person.link);
        const description = prompt('Enter new description:', person.description);

        if (name !== null && link !== null) {
            person.name = name.trim();
            person.link = link.trim();
            person.description = description.trim();

            GM_setValue('favoritePeople', favorites);

            renderFavoritesList();
        }
    }

    function deleteFavorite(index) {
        if (confirm('Are you sure you want to delete this favorite?')) {
            favorites.splice(index, 1);
            GM_setValue('favoritePeople', favorites);

            renderFavoritesList();
        }
    }

    window.addEventListener('load', function() {
        createFavoritesManager();
    });
})();
