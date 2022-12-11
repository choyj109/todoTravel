import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import { Feather } from "@expo/vector-icons";

const STORAGE_KEY = "@todos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState({});
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadTodo = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        // null값 오류 방지
        setTodos(JSON.parse(s));
      }
    } catch (e) {
      alert(`오류: ${e}`);
    }
  };
  useEffect(() => {
    loadTodo();
  }, []);
  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newTodos = { ...todos, [Date.now()]: { text, working } };
    setTodos(newTodos);
    await saveTodos(newTodos);
    setText("");
  };
  const deleteTodo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "cancel" },
      {
        text: "I'm sure",
        onPress: async () => {
          const newTodos = { ...todos };
          delete newTodos[key];
          setTodos(newTodos);
          await saveTodos(newTodos);
        },
      },
    ]);
    return;
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onChangeText={onChangeText}
        onSubmitEditing={addTodo}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a Todo" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(todos).map((key) =>
          todos[key].working === working ? (
            <View style={styles.todo} key={key}>
              <Text style={styles.todoText}>{todos[key].text}</Text>
              <TouchableOpacity
                onPress={() => {
                  deleteTodo(key);
                }}
              >
                <Text>
                  <Feather name="trash-2" size={20} color={theme.lightGrey} />
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 10,
  },
  todo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
