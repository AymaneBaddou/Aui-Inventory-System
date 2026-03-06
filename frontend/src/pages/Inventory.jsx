function Inventory({ items }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-sm">📦</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Current Stock</h2>
        </div>
        <p className="text-gray-600 text-sm">Overview of all inventory items and their quantities</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📦</span>
          </div>
          <p className="text-gray-500 text-lg font-medium">No items in inventory</p>
          <p className="text-gray-400 text-sm mt-1">Add your first item to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Picture</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.item_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">#{item.item_id}</td>
                  <td className="px-6 py-4">
                    {item.picture_url ? (
                      <img src={item.picture_url} alt={item.item_name} className="w-12 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">📦</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.item_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      item.current_quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : item.current_quantity < 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.current_quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Inventory