import React, { useState, useEffect } from 'react';
import {StatusBar, TouchableOpacity, Text, View, StyleSheet, TextInput, Alert, Image, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

export default function App() {
  // State variables
  const [menuItems, setMenuItems] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const [editedImage, setEditedImage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    loadMenuItems();
    onFetchUpdateAsync();
  }, []);

  const saveMenuItems = async (items) => {
    try {
      await AsyncStorage.setItem('menuItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const items = await AsyncStorage.getItem('menuItems');
      if (items !== null) {
        setMenuItems(JSON.parse(items));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddMenuItem = () => {
    setIsAddingItem(true);
    setPreviewImage('');
  };

  const handleCancel = () => {
    setIsAddingItem(false);
    setItemName('');
    setItemPrice('');
    setItemImage('');
    setPreviewImage('');
  };

  const handleSubmit = () => {
    if (itemName && itemPrice && itemImage) {
      const newItem = { name: itemName, price: itemPrice, image: itemImage };
      const updatedItems = [...menuItems, newItem];
      setMenuItems(updatedItems);
      saveMenuItems(updatedItems);
      setIsAddingItem(false);
      setItemName('');
      setItemPrice('');
      setItemImage('');
    } else {
      Alert.alert('Please fill in all fields');
    }
  };

  const handleDelete = (index) => {
    const updatedItems = [...menuItems];
    updatedItems.splice(index, 1);
    setMenuItems(updatedItems);
    saveMenuItems(updatedItems);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedName(menuItems[index].name);
    setEditedPrice(menuItems[index].price);
    setEditedImage(menuItems[index].image);
    setModalVisible(true);
  };

  const handleUpdate = () => {
    if (editedName && editedPrice && editedImage) {
      const updatedItems = [...menuItems];
      updatedItems[editIndex] = { name: editedName, price: editedPrice, image: editedImage };
      setMenuItems(updatedItems);
      saveMenuItems(updatedItems);
      setModalVisible(false);
    } else {
      Alert.alert('Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Menu</Text>
      {!isAddingItem && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddMenuItem}>
          <Ionicons name="add-circle" size={24} color="#000000" />
          <Text style={styles.buttonText}>Add Menu</Text>
        </TouchableOpacity>
      )}
      {isAddingItem && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={itemName}
            onChangeText={text => setItemName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Item Price"
            value={itemPrice}
            onChangeText={text => setItemPrice(text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Item Image URL"
            value={itemImage}
            onChangeText={(text) => {
              setItemImage(text);
              setPreviewImage(text);
            }}
          />
          {previewImage !== '' && (
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        {menuItems.map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity onPress={() => handleDelete(index)} style={styles.deleteButton}>
              <Ionicons name="trash" size={24} color="#FF6347" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEdit(index)} style={styles.editButton}>
              <Ionicons name="create-outline" size={24} color="#000000" />
            </TouchableOpacity>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardPrice}>Price: {item.price}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <StatusBar style="auto" />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Menu Item</Text>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={editedName}
              onChangeText={text => setEditedName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Item Price"
              value={editedPrice}
              onChangeText={text => setEditedPrice(text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Item Image URL"
              value={editedImage}
              onChangeText={(text) => {
                setEditedImage(text);
                setPreviewImage(text);
              }}
            />
            {previewImage !== '' && (
              <Image source={{ uri: previewImage }} style={styles.previewImage} />
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    width: '90%',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '90%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  submitButton: {
    backgroundColor: '#ff4e3a',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 10,
    width: '100%', // Make the card fill the width of the screen
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 10,
  },
  cardText: {
    flex: 1,
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardPrice: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    width: '90%',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
});
