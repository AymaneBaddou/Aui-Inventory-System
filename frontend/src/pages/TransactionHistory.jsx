import { useState, useEffect } from 'react'
import axios from 'axios'

function TransactionHistory() {
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    itemId: '',
    department: '',
    personInCharge: ''
  })
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchOperations()
    fetchItems()
  }, [])

  useEffect(() => {
    fetchOperations(filters)
  }, [filters])

  const fetchOperations = (filterParams = {}) => {
    const params = new URLSearchParams()
    
    if (filterParams.startDate && filterParams.startDate.trim()) params.append('start_date', filterParams.startDate)
    if (filterParams.endDate && filterParams.endDate.trim()) params.append('end_date', filterParams.endDate)
    if (filterParams.itemId && filterParams.itemId.trim()) params.append('item_id', filterParams.itemId)
    if (filterParams.department && filterParams.department.trim()) params.append('department', filterParams.department)
    if (filterParams.personInCharge && filterParams.personInCharge.trim()) params.append('person_in_charge', filterParams.personInCharge)
    
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://aui-inventory-system.onrender.com'
    const url = `${baseUrl}/operations/${params.toString() ? '?' + params.toString() : ''}`
    
    console.log('Fetching operations from:', url)
    
    axios.get(url)
      .then(response => {
        console.log('Operations response:', response.data.length, 'operations')
        console.log('Sample operation:', response.data[0])
        setOperations(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching operations:", error)
        setLoading(false)
      })
  }

  const fetchItems = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://aui-inventory-system.onrender.com'
    axios.get(`${baseUrl}/items/`)
      .then(response => {
        setItems(response.data)
      })
      .catch(error => console.error("Error fetching items:", error))
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      itemId: '',
      department: '',
      personInCharge: ''
    })
    setLoading(true) // Reset loading state when clearing filters
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const inputStyles = "bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
  const buttonStyles = "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-sm">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          </div>
          <p className="text-gray-600 text-sm">View and filter all inventory operations</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className={inputStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className={inputStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <select
              value={filters.itemId}
              onChange={(e) => handleFilterChange('itemId', e.target.value)}
              className={inputStyles}
            >
              <option value="">All Items</option>
              {items.map(item => (
                <option key={item.item_id} value={item.item_id}>
                  {item.item_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              placeholder="Filter by department"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className={inputStyles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Person in Charge</label>
            <input
              type="text"
              placeholder="Filter by person"
              value={filters.personInCharge}
              onChange={(e) => handleFilterChange('personInCharge', e.target.value)}
              className={inputStyles}
            />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button 
            onClick={clearFilters}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Clear Filters
          </button>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {operations.length} transactions
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Person in Charge</th>
                <th className="px-6 py-3">Department</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((operation) => (
                <tr key={operation.operation_id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">
                    {formatDate(operation.operation_date)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {operation.item_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      operation.operation_type === 'in'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {operation.operation_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {operation.quantity_moved}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {operation.person_in_charge}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {operation.department}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {operations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {Object.values(filters).some(filter => filter.trim()) 
                ? "No transactions found matching the current filters."
                : "No transactions found. Try adding some items with initial quantities or logging operations."
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionHistory