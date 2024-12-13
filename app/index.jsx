import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";


const fetchDataFromApi = async () => {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/posts")
    const apiData = response.data;

    const localData = await AsyncStorage.getItem("localData");
    const parsedLocalData = localData ? JSON.parse(localData) : []

    const updatedData = apiData.map((record) => {
      const existingRecord = parsedLocalData.find((item) => item.id === record.id)
      return existingRecord ? {...existingRecord, ...record} : record
    })
    
    await AsyncStorage.setItem("localData", JSON.stringify(updatedData))
    return updatedData
  } catch (error) {
    console.log("error while fetching data from the Api: ", error);
    return [] ;
  }
} 

const fetchDataFromLocalStorage = async () => {
  try {
    
    const localData = await AsyncStorage.getItem("localData");
    return localData ? JSON.parse(localData) : []
  } catch (error) {
    console.log("error while fetching data from local storage: ", error);
    return [];
    
  }
}

export default function Index() {

  const [data, setData] = useState("");

  useEffect (() => {
    const fetchData = async () => {
      const localData = await fetchDataFromLocalStorage();
      setData(localData)
    }
    fetchData()
  }, [])

  const handleRefresh = async () => {
    const updatedData = await fetchDataFromApi ()
    setData (updatedData);
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>project started running successfully</Text>
    </View>
  );
}
