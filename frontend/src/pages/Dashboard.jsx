import Inventory from './Inventory'

function Dashboard({ items, onRefreshItems }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Stock</h1>
        <p className="text-gray-600">View all items currently in inventory</p>
      </div>

      {/* Current Stock */}
      <Inventory items={items} />
    </div>
  )
}

export default Dashboard