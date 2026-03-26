import { useState } from 'react'
import axios from 'axios'

function AddItem({ onItemAdded }) {
  const [itemName, setItemName] = useState('')
  const [picture, setPicture] = useState('')
  const [initialQuantity, setInitialQuantity] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('item_name', itemName)
    if (selectedFile) {
      formData.append('picture', selectedFile)
    }
    
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/items/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((response) => {
      const newItemId = response.data.item_id;
      if (parseInt(initialQuantity) > 0) {
        return axios.post(`${import.meta.env.VITE_API_BASE_URL}/operations/`, {
          item_id: newItemId,
          operation_type: 'in',
          quantity_moved: parseInt(initialQuantity),
          person_in_charge: 'Initial Setup'
        });
      }
    })
    .then(() => {
      setItemName('')
      setInitialQuantity('')
      setSelectedFile(null)
      onItemAdded() // Callback to refresh inventory
    })
    .catch(error => console.error("Error adding item:", error))
    .finally(() => setIsUploading(false))
  }

  const inputStyles = "w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-500";
  const buttonStyles = "w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40";

  return (
    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-sm">📦</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Create New Item</h2>
        </div>
        <p className="text-gray-600 text-sm">Add a new item to your inventory system</p>
      </div>

      <form onSubmit={handleAddItem} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
          <input
            type="text"
            placeholder="e.g., HDMI Cable, Laptop, Projector..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            className={inputStyles}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Initial Quantity</label>
          <input
            type="number"
            min="0"
            placeholder="e.g., 5"
            value={initialQuantity}
            onChange={(e) => setInitialQuantity(e.target.value)}
            className={inputStyles}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Picture <span className="text-gray-500">(optional)</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <button type="submit" className={buttonStyles} disabled={isUploading}>
          {isUploading ? 'Adding Item...' : 'Add to Inventory'}
        </button>
      </form>
    </div>
  )
}

export default AddItem