import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

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
    <ImageBackground
      source={{ uri: "https://source.unsplash.com/random/800x800/?technology" }}
      style={styles.background}
    >
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.gradient}>
        <Text style={styles.header}>My Data App</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleFetchData("posts")}
          >
            <Text style={styles.buttonText}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleFetchData("comments")}
          >
            <Text style={styles.buttonText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleFetchData("users")}
          >
            <Text style={styles.buttonText}>Users</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteData}>
          <Text style={styles.buttonText}>Delete Local Data</Text>
        </TouchableOpacity>

        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No data available. Please fetch or refresh data.
            </Text>
          }
        />
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#32CD32",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: "#ff4500",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
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
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
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
    color: "#fff",
    marginTop: 50,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});
