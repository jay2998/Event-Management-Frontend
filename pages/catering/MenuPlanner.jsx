import React, { useState, useEffect } from 'react';
import { Utensils, Wine, IceCream, Coffee, Trash2, Plus, Minus, Pencil } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useLocation } from 'react-router-dom';
import { updateBookingMenu, fetchBookingMenu, fetchMenuDraft, saveMenuDraft, createCateringOrder } from '../../services/api';

const defaultMenuItems = {
  appetizers: [
    { id: 'app1', name: 'Samosa', price: 150, description: 'Crispy pastry filled with spiced potatoes and peas' },
    { id: 'app2', name: 'Pakora', price: 250, description: 'Deep-fried vegetable fritters with chickpea flour batter' },
    { id: 'app3', name: 'Dahi Bhalla', price: 450, description: 'Fried lentil dumplings in yogurt sauce' },
    { id: 'app4', name: 'Seekh Kebab', price: 1200, description: 'Minced meat kebabs with aromatic spices' }
  ],
  mains: [
    { id: 'main1', name: 'Biryani', price: 2500, description: 'Fragrant rice layered with spiced meat' },
    { id: 'main2', name: 'Chicken Karahi', price: 3200, description: 'Chicken cooked in wok with tomatoes and spices' },
    { id: 'main3', name: 'Nihari', price: 3500, description: 'Slow-cooked beef stew with rich spices' },
    { id: 'main4', name: 'Haleem', price: 2800, description: 'Slow-cooked wheat and lentil stew with meat' },
    { id: 'main5', name: 'Lamb Korma', price: 4500, description: 'Tender lamb in creamy yogurt-based sauce' }
  ],
  desserts: [
    { id: 'dessert1', name: 'Gulab Jamun', price: 600, description: 'Deep-fried milk dumplings in sugar syrup' },
    { id: 'dessert2', name: 'Kheer', price: 800, description: 'Rice pudding with cardamom and nuts' },
    { id: 'dessert3', name: 'Jalebi', price: 400, description: 'Crispy, pretzel-shaped sweets soaked in syrup' },
    { id: 'draft4', name: 'Kulfi', price: 750, description: 'Traditional Indian ice cream with pistachios' }
  ],
  beverages: [
    { id: 'bev1', name: 'Lassi', price: 350, description: 'Yogurt-based drink, sweet or salty' },
    { id: 'bev2', name: 'Rooh Afza', price: 200, description: 'Refreshing rose-flavored drink' },
    { id: 'bev3', name: 'Chai', price: 150, description: 'Traditional spiced tea' },
    { id: 'bev4', name: 'Mango Lassi', price: 550, description: 'Yogurt drink blended with mango' }
  ]
};

const MenuPlanner = () => {
  const location = useLocation();
  
  const [bookingDetails, setBookingDetails] = useState({ bookingId: null, guestCount: null });
  const [draftItems, setDraftItems] = useState([]);
  const [showAddDishForm, setShowAddDishForm] = useState(false);
  const [newDishFormData, setNewDishFormData] = useState({ name: '', price: '', description: '', category: 'appetizers', suggestedQuantity: 1 });
  const [categoryFilter, setCategoryFilter] = useState('all'); // For filtering menu items
  const [editingId, setEditingId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined') return {};
      return JSON.parse(userStr);
    } catch { return {}; }
  };
  const user = getUser();
  const isCustomer = user.role === 'customer';

  // State for menu items, initialized from localStorage or defaults
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const storedMenuItems = localStorage.getItem('customMenuItems');
      return storedMenuItems ? JSON.parse(storedMenuItems) : defaultMenuItems;
    } catch (error) {
      console.error("Failed to load menu items from localStorage", error);
      return defaultMenuItems;
    }
  });

  // Effect to save menuItems to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customMenuItems', JSON.stringify(menuItems));
  }, [menuItems]);

  const categories = [
    { id: 'appetizers', name: 'Appetizers', icon: <Utensils size={20} /> },
    { id: 'mains', name: 'Mains', icon: <Utensils size={20} /> },
    { id: 'desserts', name: 'Desserts', icon: <IceCream size={20} /> },
    { id: 'beverages', name: 'Beverages', icon: <Wine size={20} /> }
  ];
  const allCategoryIds = ['all', ...categories.map(cat => cat.id)];

  const addToDraft = (item, category) => {
    // Calculate suggested quantity based on guest count if available
    let suggestedQuantity = 1;
    if (bookingDetails.guestCount) {
      switch (category) {
        case 'appetizers':
          suggestedQuantity = Math.ceil(bookingDetails.guestCount * 2.5); // 2-3 portions per guest
          break;
        case 'mains':
          suggestedQuantity = Math.ceil(bookingDetails.guestCount * 1); // 1 portion per guest
          break;
        case 'desserts':
          suggestedQuantity = Math.ceil(bookingDetails.guestCount * 1); // 1 portion per guest
          break;
        case 'beverages':
          suggestedQuantity = Math.ceil(bookingDetails.guestCount * 1.5); // 1-2 portions per guest
          break;
        default:
          suggestedQuantity = 1;
      }
      // Ensure minimum 1 if guestCount is very low
      suggestedQuantity = Math.max(1, suggestedQuantity);
    }


    const existingItem = draftItems.find(draftItem => draftItem.id === item.id);
    
    if (existingItem) {
      setDraftItems(draftItems.map(draftItem => 
        draftItem.id === item.id 
          ? { ...draftItem, quantity: draftItem.quantity + 1 } 
          : draftItem
      ));
    } else { // Add with suggested quantity
      setDraftItems([...draftItems, { ...item, quantity: suggestedQuantity, category }]);
    }
  };

  const removeFromDraft = (id) => {
    setDraftItems(draftItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, change) => {
    setDraftItems(draftItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const resetDishForm = () => {
    setEditingId(null);
    setNewDishFormData({ name: '', price: '', description: '', category: 'appetizers', suggestedQuantity: 1 });
    setShowAddDishForm(false);
  };

  const handleEditDish = (item, categoryId) => {
    setEditingId(item.id);
    setNewDishFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: categoryId,
      suggestedQuantity: item.quantity || 1
    });
    setShowAddDishForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDish = (itemId, categoryId) => {
    if (window.confirm('Remove this dish from the available menu?')) {
      setMenuItems(prev => ({
        ...prev,
        [categoryId]: prev[categoryId].filter(i => i.id !== itemId)
      }));
    }
  };

  const handleAddDish = (e) => {
    e.preventDefault();
    let suggestedQuantity = 1;
    if (bookingDetails.guestCount) {
      switch (newDishFormData.category) {
        case 'appetizers': suggestedQuantity = Math.ceil(bookingDetails.guestCount * 2.5); break;
        case 'mains': suggestedQuantity = Math.ceil(bookingDetails.guestCount * 1); break;
        case 'desserts': suggestedQuantity = Math.ceil(bookingDetails.guestCount * 1); break;
        case 'beverages': suggestedQuantity = Math.ceil(bookingDetails.guestCount * 1.5); break;
        default: suggestedQuantity = 1;
      }
      suggestedQuantity = Math.max(1, suggestedQuantity);
    }

    if (editingId) {
      setMenuItems(prev => {
        const updatedMenu = { ...prev };
        
        // Remove item from all categories first to handle potential category changes correctly
        Object.keys(updatedMenu).forEach(cat => {
          updatedMenu[cat] = updatedMenu[cat].filter(item => item.id !== editingId);
        });
        
        const updatedItem = { 
          ...newDishFormData, 
          id: editingId, 
          price: parseFloat(newDishFormData.price) 
        };
        
        // Add the updated item to the selected category
        updatedMenu[newDishFormData.category] = [...(updatedMenu[newDishFormData.category] || []), updatedItem];
        return updatedMenu;
      });
    } else {
      const newDish = { 
        ...newDishFormData, 
        id: Date.now().toString(), 
        price: parseFloat(newDishFormData.price),
        quantity: suggestedQuantity 
      };
      setMenuItems(prev => ({
        ...prev,
        [newDish.category]: [...(prev[newDish.category] || []), newDish]
      }));
    }
    resetDishForm();
  };

  const handleSaveMenu = async () => {
    try {
      if (bookingDetails.bookingId) {
        await updateBookingMenu(bookingDetails.bookingId, draftItems);
        setSaveStatus('Menu saved to booking.');
      } else {
        await saveMenuDraft({
          items: draftItems,
          guestCount: bookingDetails.guestCount,
          totalPrice
        });
        await createCateringOrder({
          name: 'Menu Planner Live Order',
          eventName: 'Menu Planner Live Order',
          eventDate: new Date().toISOString(),
          guestCount: bookingDetails.guestCount || draftItems.reduce((sum, item) => sum + item.quantity, 0),
          items: draftItems,
          menuItems: draftItems,
          totalPrice,
          status: 'Pending'
        });
        setSaveStatus('Menu draft saved in database.');
      }
    } catch (error) {
      console.error('Failed to save menu:', error);
      alert('Failed to save menu.');
    }
  };

  const handleCreateLiveOrder = async () => {
    try {
      const orderPayload = {
        name: 'Menu Planner Live Order',
        eventName: 'Menu Planner Live Order',
        eventDate: new Date().toISOString(),
        guestCount: bookingDetails.guestCount || draftItems.reduce((sum, item) => sum + item.quantity, 0),
        items: draftItems,
        menuItems: draftItems,
        totalPrice,
        status: 'Pending'
      };

      if (bookingDetails.bookingId) {
        orderPayload.bookingId = bookingDetails.bookingId;
      }

      await createCateringOrder(orderPayload);
      setSaveStatus('Live order created for quality inspection.');
    } catch (error) {
      console.error('Failed to create live order:', error);
      alert('Failed to create live order.');
    }
  };

  const totalItems = draftItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = draftItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bookingId = location.state?.bookingId || params.get('bookingId') || localStorage.getItem('menuBookingId');
    const guestCount = location.state?.guestCount || Number(params.get('guestCount')) || null;

    const loadDraft = async () => {
      if (bookingId) {
        localStorage.setItem('menuBookingId', bookingId);
        setBookingDetails({ bookingId, guestCount });

        try {
          const response = await fetchBookingMenu(bookingId);
          const savedItems = response.data?.data || [];
          if (Array.isArray(savedItems)) {
            setDraftItems(savedItems);
          }
        } catch (error) {
          console.error('Failed to load booking menu:', error);
        }
        return;
      }

      setBookingDetails({ bookingId: null, guestCount });

      try {
        const response = await fetchMenuDraft();
        const savedDraft = response.data?.data;
        if (savedDraft?.items && Array.isArray(savedDraft.items)) {
          setDraftItems(savedDraft.items);
        }
      } catch (error) {
        console.error('Failed to load saved menu draft:', error);
      }
    };

    loadDraft();
  }, [location.search, location.state]);

  return (
    <div style={styles.container}>
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 style={styles.title}>Menu Planner</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {!isCustomer && (
             <button onClick={() => { if(showAddDishForm) resetDishForm(); else setShowAddDishForm(true); }} style={styles.addButton}>
               {showAddDishForm ? 'Cancel' : '+ Add New Dish'}
             </button>
          )}
          {bookingDetails.bookingId && (
            <span style={styles.bookingInfo}>Booking ID: {bookingDetails.bookingId.slice(-6)}</span>
          )}
          {bookingDetails.guestCount && (
            <span style={styles.bookingInfo}>Guests: {bookingDetails.guestCount}</span>
          )}
          {saveStatus && (
            <span style={styles.saveStatus}>{saveStatus}</span>
          )}
        </div>
      </div>

      {showAddDishForm && !isCustomer && (
        <div style={styles.formCard} className="!p-4 sm:!p-6">
          <h2 style={styles.sectionTitle}>{editingId ? 'Update Dish Details' : 'Add New Dish'}</h2>
          <form onSubmit={handleAddDish} style={styles.form}>
            <div style={styles.formGrid} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              <div style={styles.formGroup}>
                <label style={styles.label}>Dish Name *</label>
                <input type="text" value={newDishFormData.name} onChange={(e) => setNewDishFormData({...newDishFormData, name: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price *</label>
                <input type="number" step="0.01" value={newDishFormData.price} onChange={(e) => setNewDishFormData({...newDishFormData, price: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select value={newDishFormData.category} onChange={(e) => setNewDishFormData({...newDishFormData, category: e.target.value})} style={styles.select}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ ...styles.formGroup, gridColumn: 'span 3' }} className="sm:col-span-2 xl:col-span-3">
                <label style={styles.label}>Description</label>
                <textarea value={newDishFormData.description} onChange={(e) => setNewDishFormData({...newDishFormData, description: e.target.value})} style={{ ...styles.input, minHeight: '80px' }} />
              </div>
            </div>
            <button type="submit" style={styles.submitButton}>{editingId ? 'Update Dish' : 'Add Dish'}</button>
          </form>
        </div>
      )}

      {/* Category Tabs */}
      <div style={styles.categoryTabs} className="flex-wrap">
        {allCategoryIds.map(catId => {
          const category = categories.find(c => c.id === catId);
          const name = category ? category.name : 'All';
          return (
            <button key={catId} onClick={() => setCategoryFilter(catId)} style={categoryFilter === catId ? {...styles.categoryTab, ...styles.categoryTabActive} : styles.categoryTab}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          );
        })}
      </div>

      <div style={styles.mainGrid} className="grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
        {/* Menu Items Section */}
        <div style={styles.menuItemsSection}>
          <h2 style={styles.sectionTitle}>Available Dishes</h2>
          <div style={styles.dishGrid} className="grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
            {categories.filter(cat => categoryFilter === 'all' || cat.id === categoryFilter).map(category => (
              (menuItems[category.id] || []).map(item => (
                <div key={item.id} style={styles.dishCard} className="p-4 sm:p-5 rounded-[18px]">
                  <div style={styles.dishHeader}>
                    <span style={styles.dishIcon}>{category.icon}</span>
                    <span style={styles.categoryBadge}>{category.name}</span>
                  </div>
                  <h3 style={styles.dishName} className="text-[17px] sm:text-[18px]">{item.name}</h3>
                  <p style={styles.dishDescription}>{item.description}</p>
                  <div style={styles.dishFooter} className="flex-col sm:flex-row">
                    <span style={styles.dishPrice}>Rs. {item.price.toLocaleString()}</span>
                    <div style={styles.dishActionGroup} className="w-full sm:w-auto justify-end">
                       <button
                         type="button"
                         onClick={() => addToDraft(item, category.id)}
                         style={styles.addCardButton}
                       >
                         <Plus size={14} /> Add
                       </button>
                       {!isCustomer && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditDish(item, category.id)}
                              style={{
                                ...styles.iconBtn,
                                backgroundColor: 'var(--color-primary-50)',
                                color: 'var(--color-primary)',
                                border: '1px solid var(--color-primary-100)'
                              }}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDish(item.id, category.id)}
                              style={{
                                ...styles.iconBtn,
                                backgroundColor: 'var(--color-error-light)',
                                color: 'var(--color-error)',
                                border: '1px solid var(--color-error)'
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                       )}
                    </div>
                  </div>
                </div>
              ))
            ))}
            {/* Display message if no dishes found for filter */}
            {categories.filter(cat => categoryFilter === 'all' || cat.id === categoryFilter).every(cat => !(menuItems[cat.id] || []).length) && (
              <div style={styles.noData}>No dishes found for this category.</div>
            )}
          </div>
        </div>

        {/* Menu Draft Section */}
        <div style={styles.menuDraftSection}>
           <div style={styles.formCard} className="!p-4 sm:!p-6"> {/* Reusing formCard for the draft section */}
             <div style={styles.draftHeader}>
               <h2 style={styles.sectionTitle}>Menu Draft</h2>
               <span style={styles.draftItemCount}>
                {totalItems} items
              </span>
            </div>

            {draftItems.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🍽️</span>
                <p style={styles.emptyText}>Your selection is empty. Start adding dishes from the menu.</p>
              </div>
            ) : (
                <div style={styles.draftList}>
                  {draftItems.map(item => (
                  <div key={item.id} style={styles.draftItem} className="flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div style={styles.draftItemInfo}>
                      <h3 style={styles.draftItemName}>{item.name}</h3>
                      <p style={styles.draftItemPrice}>Rs. {item.price.toLocaleString()} each</p>
                    </div>

                    <div style={styles.draftItemActions} className="w-full sm:w-auto flex-wrap justify-start sm:justify-end">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={styles.quantityButton}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={styles.quantityDisplay}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={styles.quantityButton}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromDraft(item.id)}
                          style={styles.dangerIconBtn}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                 <div style={styles.draftSummary} className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                   <div style={styles.draftTotal}>
                     Total: <span style={styles.draftTotalPrice}>Rs. {totalPrice.toLocaleString()}</span>
                   </div>
                   <div style={styles.draftActions} className="w-full sm:w-auto">
                     <button type="button" style={styles.secondaryButton} onClick={handleCreateLiveOrder}>
                       Create Live Order
                     </button>
                    <button type="button" style={styles.submitButton} onClick={handleSaveMenu}>
                      Save Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Planner Tips */}
          <div style={styles.formCard}> {/* Reusing formCard for tips */}
            <h2 style={styles.sectionTitle}>Planner Tips</h2>
            <div style={styles.tipCard}>
              <p style={styles.tipText}>
                According to local event regulations, serving more than one main dish may result in penalties.
                Try combining multiple appetizers with a single premium main dish for the best experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '28px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '30px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '-0.4px' },
  addButton: { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  bookingInfo: { marginLeft: '20px', fontSize: '16px', fontWeight: '500', color: 'var(--color-text-light)' },
  saveStatus: { marginLeft: '20px', fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' },
  formCard: { backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--color-card-shadow)', marginBottom: '24px', border: '1px solid var(--color-border)' },
  sectionTitle: { fontSize: '19px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '16px', letterSpacing: '-0.2px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
   formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' },
  input: { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)' },
  select: { padding: '12px 14px', fontSize: '14px', border: '1px solid var(--color-border)', borderRadius: '12px', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' },
  submitButton: { padding: '12px 24px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', alignSelf: 'flex-start' },

  categoryTabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  categoryTab: { padding: '9px 16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text)', textTransform: 'capitalize' },
  categoryTabActive: { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },

   mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }, // Two columns collapse naturally on small screens
  menuItemsSection: {},
  menuDraftSection: {},

   dishGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', marginBottom: '24px' },
   dishCard: { backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '20px', boxShadow: 'var(--color-card-shadow)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' },
  dishHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  dishIcon: { fontSize: '24px', color: 'var(--color-text-light)' },
  categoryBadge: { padding: '6px 12px', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)', borderRadius: '999px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' },
  dishName: { fontSize: '18px', fontWeight: '800', color: 'var(--color-text)', marginBottom: '4px', letterSpacing: '-0.2px' },
  dishDescription: { fontSize: '13px', color: 'var(--color-text-light)', marginBottom: '10px', flexGrow: 1, lineHeight: 1.55 },
   dishFooter: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap' },
  dishPrice: { fontSize: '17px', fontWeight: '700', color: 'var(--color-primary)' },
  dishActionGroup: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  addCardButton: { height: '36px', padding: '0 14px', borderRadius: '12px', border: '1px solid #0f766e', background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 10px 18px rgba(15,118,110,0.18)' },
  contactButton: { padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center' }, // Reusing for Add to Menu

  noData: { gridColumn: '1 / -1', textAlign: 'center', padding: '44px', color: 'var(--color-text-light)', backgroundColor: 'var(--color-surface)', borderRadius: '16px' },

  draftHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  draftItemCount: { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' },
  draftList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  draftItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', border: '1px solid var(--color-border)', borderRadius: '14px', backgroundColor: 'var(--color-surface-soft)' },
  draftItemInfo: { flex: 1 },
  draftItemName: { fontSize: '15px', fontWeight: '700', color: 'var(--color-text)' },
  draftItemPrice: { fontSize: '13px', color: 'var(--color-text-light)' },
  draftItemActions: { display: 'flex', alignItems: 'center', gap: '8px' },
  quantityButton: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-border)', color: 'var(--color-text)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
  quantityDisplay: { fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' },
  deleteButton: { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', padding: '6px 10px' },
   draftSummary: { marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', gap: '16px' },
  draftActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  draftTotal: { fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' },
  draftTotalPrice: { color: 'var(--color-primary)' },
  secondaryButton: { padding: '12px 24px', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  iconBtn: { width: '36px', height: '36px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, border: '1px solid var(--color-primary-100)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary)' },
  dangerIconBtn: { width: '36px', height: '36px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, border: '1px solid var(--color-error)', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '44px', color: 'var(--color-text-light)' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyText: { fontSize: '15px', textAlign: 'center', maxWidth: '300px', lineHeight: 1.55 },

  tipCard: { backgroundColor: 'var(--color-primary-50)', borderLeft: '4px solid var(--color-primary)', padding: '18px', borderRadius: '14px' },
  tipText: { fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.6 }
};

export default MenuPlanner;
