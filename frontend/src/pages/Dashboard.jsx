import Inventory from './Inventory'

function Dashboard({ items, onRefreshItems }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
    
      {/* Current Stock */}
      <Inventory items={items} />
    </div>
  )
}

export default Dashboard