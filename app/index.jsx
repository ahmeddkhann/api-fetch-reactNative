import React, { useEffect, useState } from "react";
import { Text, View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const fetchDataFromApi = async (type) => {
  try {
    const urls = {
      posts: "https://jsonplaceholder.typicode.com/posts",
      comments: "https://jsonplaceholder.typicode.com/comments",
      users: "https://jsonplaceholder.typicode.com/users",
    };

    const response = await axios.get(urls[type]);
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
    console.log(`Error while fetching ${type} data from the API: `, error);
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

const deleteLocalStorageData = async () => {
  try {
    await AsyncStorage.removeItem("localData");
    console.log("Local data deleted successfully.");
  } catch (error) {
    console.log("Error while deleting local data: ", error);
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

  const handleFetchData = async (type) => {
    const updatedData = await fetchDataFromApi(type);
    setData(updatedData);
  };

  const handleDeleteData = async () => {
    await deleteLocalStorageData();
    setData([]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.name || item.title}</Text>
      <Text style={styles.itemBody}>{item.email || item.body}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Data App</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.fetchButton]}
          onPress={() => handleFetchData("posts")}
        >
          <Text style={styles.buttonText}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.fetchButton]}
          onPress={() => handleFetchData("comments")}
        >
          <Text style={styles.buttonText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.fetchButton]}
          onPress={() => handleFetchData("users")}
        >
          <Text style={styles.buttonText}>Users</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteData}>
        <Text style={styles.buttonText}>Delete Local Data</Text>
      </TouchableOpacity>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No data available. Please fetch or refresh data.</Text>
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  fetchButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#FF6347",
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
