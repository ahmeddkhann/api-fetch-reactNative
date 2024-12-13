import React, { useEffect, useState } from "react";
import { Text, View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const fetchDataFromApi = async () => {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/comments");
    const apiData = response.data;

    const localData = await AsyncStorage.getItem("localData");
    const parsedLocalData = localData ? JSON.parse(localData) : [];

    const updatedData = apiData.map((record) => {
      const existingRecord = parsedLocalData.find((item) => item.id === record.id);
      return existingRecord ? { ...existingRecord, ...record } : record;
    });

    await AsyncStorage.setItem("localData", JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.log("Error while fetching data from the API: ", error);
    return [];
  }
};

const fetchDataFromLocalStorage = async () => {
  try {
    const localData = await AsyncStorage.getItem("localData");
    return localData ? JSON.parse(localData) : [];
  } catch (error) {
    console.log("Error while fetching data from local storage: ", error);
    return [];
  }
};

export default function Index() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const localData = await fetchDataFromLocalStorage();
      setData(localData);
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    const updatedData = await fetchDataFromApi();
    setData(updatedData);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemBody}>{item.body}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Data App</Text>
      <TouchableOpacity style={styles.button} onPress={handleRefresh}>
        <Text style={styles.buttonText}>Refresh Data</Text>
      </TouchableOpacity>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No data available. Please refresh.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  itemBody: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#aaa",
    marginTop: 50,
  },
});
