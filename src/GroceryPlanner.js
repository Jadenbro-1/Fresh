import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Modal, Image, TextInput } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const GroceryPlanner = ({ navigation }) => {
  const [shoppingList, setShoppingList] = useState([
    { item: "Apples", quantity: 4, checked: false },
    { item: "Bananas", quantity: 6, checked: false },
    { item: "Broccoli", quantity: 1, checked: false },
  ]);
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const addItem = () => {
    if (newItem && newQuantity) {
      setShoppingList([...shoppingList, { item: newItem, quantity: parseInt(newQuantity), checked: false }]);
      setNewItem('');
      setNewQuantity('');
      setModalVisible(false);
    }
  };

  const handleCheck = (index) => {
    const updatedList = [...shoppingList];
    updatedList[index].checked = !updatedList[index].checked;
    updatedList.push(updatedList.splice(index, 1)[0]); // Move the checked item to the bottom
    setShoppingList(updatedList);
  };

  const renderShoppingItem = (item, index) => (
    <View style={styles.shoppingItemContainer} key={index}>
      <TouchableOpacity onPress={() => handleCheck(index)} style={styles.checkboxContainer}>
        <View style={[styles.checkbox, item.checked && styles.checkedCheckbox]}>
          {item.checked && <View style={styles.checkboxTick} />}
        </View>
      </TouchableOpacity>
      <Text style={styles.shoppingItem}>{item.item}</Text>
      <Text style={styles.shoppingQuantity}>{item.quantity}</Text>
    </View>
  );

  const handleDoneShopping = () => {
    // Implement done shopping logic here
    console.log("Done shopping");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Grocery Planner</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Ship')}>
            <Image source={require('../assets/ship.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Store')}>
            <Image source={require('../assets/store.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.background}>
        <View style={styles.content}>
          {shoppingList.map((item, index) => renderShoppingItem(item, index))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Pantry')}>
          <View style={styles.navItem}>
            <Image source={require('../assets/pantry.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Pantry</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('GroceryPlanner')}>
          <View style={styles.navItem}>
            <Image source={require('../assets/shop.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Shopping List</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('WeeklyMealPlan')}>
          <View style={styles.navItem}>
            <Image source={require('../assets/plan.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Planner</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.doneButton} onPress={handleDoneShopping}>
        <Text style={styles.doneButtonText}>Done Shopping</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={newItem}
              onChangeText={setNewItem}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={newQuantity}
              onChangeText={setNewQuantity}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={addItem}>
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeAreaTop: {
    backgroundColor: '#4CAF50',
  },
  background: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    width: screenWidth,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginHorizontal: 10,
  },
  content: {
    paddingBottom: 60,
  },
  shoppingItemContainer: {
    paddingVertical: 10,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shoppingItem: {
    fontSize: 16,
    color: '#000',
  },
  shoppingQuantity: {
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10, // Make it circular
    backgroundColor: '#fff',
  },
  checkedCheckbox: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTick: {
    width: 10,
    height: 10,
    borderRadius: 5, // Make the tick circular
    backgroundColor: '#fff',
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonText: {
    fontSize: 36,
    color: '#ffffff',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    height: 75,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navText: {
    fontSize: 12,
    color: '#333333',
    marginTop: 5,
  },
  doneButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  doneButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#4CAF50',
  },
});

export default GroceryPlanner;
