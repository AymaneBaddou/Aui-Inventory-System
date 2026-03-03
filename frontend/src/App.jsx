import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [items, setItems] = useState([])
  
  const [itemName, setItemName] = useState('')
  const [picture, setPicture] = useState('')
  const [initialQuantity, setInitialQuantity] = useState('') 

  const [opItemId, setOpItemId] = useState('')
  const [opType, setOpType] = useState('in')
  const [opQuantity, setOpQuantity] = useState('')
  const [opPerson, setOpPerson] = useState('')

  const fetchItems = () => {
    axios.get('http://127.0.0.1:8000/items/')
      .then(response => {
        setItems(response.data)
        if (response.data.length > 0 && !opItemId) {
          setOpItemId(response.data[0].item_id)
        }
      })
      .catch(error => console.error("Error fetching inventory:", error))
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleAddItem = (e) => {
    e.preventDefault()
    axios.post('http://127.0.0.1:8000/items/', {
      item_name: itemName,
      picture: picture
    })
    .then((response) => {
      const newItemId = response.data.item_id;
      if (parseInt(initialQuantity) > 0) {
        return axios.post('http://127.0.0.1:8000/operations/', {
          item_id: newItemId,
          operation_type: 'in',
          quantity_moved: parseInt(initialQuantity),
          person_in_charge: 'Initial Setup'
        });
      }
    })
    .then(() => {
      setItemName('')
      setPicture('')
      setInitialQuantity('') 
      fetchItems() 
    })
    .catch(error => console.error("Error adding item:", error))
  }

  const handleOperation = (e) => {
    e.preventDefault()
    axios.post('http://127.0.0.1:8000/operations/', {
      item_id: parseInt(opItemId),
      operation_type: opType,
      quantity_moved: parseInt(opQuantity),
      person_in_charge: opPerson
    })
    .then(() => {
      setOpQuantity('')
      setOpPerson('')
      fetchItems() 
    })
    .catch(error => {
      console.error("Error updating stock:", error)
      alert("Failed to update stock. Check if you have enough quantity to remove.")
    })
  }

  // Common Tailwind classes extracted for clean, reusable inputs
  const inputStyles = "w-full bg-gray-950 border border-gray-800 text-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-600";
  const buttonStyles = "w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors mt-2 shadow-lg shadow-blue-900/20";

  return (
    <div className="min-h-screen text-gray-100 p-8 font-sans">
      
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          AUI Department Inventory
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* --- ADD NEW ITEM FORM --- */}
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-100 flex items-center gap-2">
              <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-lg text-sm">1</span> 
              Create New Item
            </h2>
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <input 
                type="text" placeholder="Item Name (e.g., HDMI Cable)" 
                value={itemName} onChange={(e) => setItemName(e.target.value)} required 
                className={inputStyles}
              />
              <input 
                type="number" min="0" placeholder="Initial Quantity (e.g., 5)" 
                value={initialQuantity} onChange={(e) => setInitialQuantity(e.target.value)} 
                className={inputStyles}
              />
              <input 
                type="text" placeholder="Picture URL (optional)" 
                value={picture} onChange={(e) => setPicture(e.target.value)} 
                className={inputStyles}
              />
              <button type="submit" className={buttonStyles}>Add to System</button>
            </form>
          </div>

          {/* --- UPDATE STOCK FORM --- */}
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-gray-100 flex items-center gap-2">
              <span className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-lg text-sm">2</span> 
              Log Operation
            </h2>
            <form onSubmit={handleOperation} className="flex flex-col gap-4">
              <select value={opItemId} onChange={(e) => setOpItemId(e.target.value)} required className={inputStyles}>
                <option value="" disabled>Select an item...</option>
                {items.map(item => (
                  <option key={item.item_id} value={item.item_id}>
                    {item.item_name} (Current: {item.current_quantity})
                  </option>
                ))}
              </select>
              
              <select value={opType} onChange={(e) => setOpType(e.target.value)} className={inputStyles}>
                <option value="in">Check IN (Add Stock)</option>
                <option value="out">Check OUT (Remove Stock)</option>
              </select>
              
              <div className="flex gap-4">
                <input 
                  type="number" min="1" placeholder="Qty" 
                  value={opQuantity} onChange={(e) => setOpQuantity(e.target.value)} required 
                  className={`${inputStyles} w-1/3`}
                />
                <input 
                  type="text" placeholder="Person in Charge" 
                  value={opPerson} onChange={(e) => setOpPerson(e.target.value)} required 
                  className={`${inputStyles} w-2/3`}
                />
              </div>
              <button type="submit" className={buttonStyles}>Confirm Operation</button>
            </form>
          </div>

        </div>

        {/* --- INVENTORY TABLE --- */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-100 px-2">Current Stock</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 italic px-2">Database is empty...</p>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-950/50 border-b border-gray-800">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {items.map(item => (
                    <tr key={item.item_id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-5 text-gray-500">{item.item_id}</td>
                      <td className="px-6 py-5 font-medium text-gray-200">{item.item_name}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          item.current_quantity === 0 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : 'bg-emerald-500/10 text-emerald-400'
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
      </div>
    </div>
  )
}

export default App