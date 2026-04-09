import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function LogOperation({ items, onOperationLogged }) {
  const { userFullName } = useAuth()
  const [opItemId, setOpItemId] = useState('')
  const [opType, setOpType] = useState('in')
  const [opQuantity, setOpQuantity] = useState('')
  const [opDepartment, setOpDepartment] = useState('')

  const handleOperation = (e) => {
    e.preventDefault()
    axios.post(`${import.meta.env.VITE_API_BASE_URL}/operations/`, {
      item_id: parseInt(opItemId),
      operation_type: opType,
      quantity_moved: parseInt(opQuantity),
      person_in_charge: userFullName || '',
      department: opDepartment
    })
    .then(() => {
      setOpQuantity('')
      setOpDepartment('')
      onOperationLogged() // Callback to refresh inventory
    })
    .catch(error => {
      console.error("Error updating stock:", error)
      alert("Failed to update stock. Check if you have enough quantity to remove.")
    })
  }

  const inputStyles = "w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-500";
  const selectStyles = "w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";
  const buttonStyles = "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40";

  return (
    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 text-sm">📝</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Log Operation</h2>
        </div>
        <p className="text-gray-600 text-sm">Record check-in or check-out operations</p>
      </div>

      <form onSubmit={handleOperation} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Item</label>
          <select
            value={opItemId}
            onChange={(e) => setOpItemId(e.target.value)}
            required
            className={selectStyles}
          >
            <option value="" disabled>Select an item...</option>
            {items.map(item => (
              <option key={item.item_id} value={item.item_id}>
                {item.item_name} (Current: {item.current_quantity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Operation Type</label>
          <select
            value={opType}
            onChange={(e) => setOpType(e.target.value)}
            className={selectStyles}
          >
            <option value="in">📥 Check IN (Add Stock)</option>
            <option value="out">📤 Check OUT (Remove Stock)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={opQuantity}
              onChange={(e) => setOpQuantity(e.target.value)}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Person in Charge</label>
            <input
              type="text"
              readOnly
              value={userFullName || 'Logged-in user'}
              className={`${inputStyles} bg-gray-100 cursor-not-allowed`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <input
            type="text"
            placeholder="Department requesting the item"
            value={opDepartment}
            onChange={(e) => setOpDepartment(e.target.value)}
            required
            className={inputStyles}
          />
        </div>

        <button type="submit" className={buttonStyles}>
          Confirm Operation
        </button>
      </form>
    </div>
  )
}

export default LogOperation