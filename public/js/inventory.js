'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const classificationList = document.querySelector('#classificationList');
  const inventoryDisplay = document.getElementById('inventoryDisplay');
  if (!classificationList || !inventoryDisplay) return;

  classificationList.addEventListener('change', () => {
    const classification_id = classificationList.value;
    if (!classification_id) {
      inventoryDisplay.innerHTML = '';
      return;
    }

    const classIdURL = `/inv/getInventory/${classification_id}`;
    fetch(classIdURL)
      .then((response) => {
        if (response.ok) return response.json();
        throw Error('Network response was not OK');
      })
      .then((data) => {
        buildInventoryList(data);
      })
      .catch((error) => {
        console.log('There was a problem: ', error.message);
        inventoryDisplay.innerHTML = '<p>Unable to load inventory.</p>';
      });
  });

  function buildInventoryList(data) {
    if (!Array.isArray(data) || data.length === 0) {
      inventoryDisplay.innerHTML = '<p>No vehicles found for this classification.</p>';
      return;
    }

    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
    dataTable += '</thead>';

    dataTable += '<tbody>';
    data.forEach((element) => {
      dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
      dataTable += `<td><a href="/inv/edit/${element.inv_id}" title="Click to update">Modify</a></td>`;
      dataTable += `<td><a href="/inv/delete/${element.inv_id}" title="Click to delete">Delete</a></td></tr>`;
    });
    dataTable += '</tbody>';

    inventoryDisplay.innerHTML = dataTable;
  }
});
