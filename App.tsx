import React, { useState, useEffect } from "react"
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
} from "react-native"
import config from "./src/aws-exports"
import { generateClient } from "aws-amplify/api"
import { createTodo } from "./src/graphql/mutations"
import { listTodos } from "./src/graphql/queries"
import { Amplify } from "aws-amplify"
// @ts-ignore
Amplify.configure(config)

// Interface for Todo Item
interface Todo {
	name: string
}

const App: React.FC = () => {
	// Use useState hook for state management
	const [name, setName] = useState<string>("")
	const [todos, setTodos] = useState<Todo[]>([])

	const client = generateClient()

	const onChangeText = (val: string) => {
		setName(val)
	}

	const addTodo = async () => {
		if (!name) return // Handle empty input

		try {
			const input = { name }
			const result = await client.graphql({
				query: createTodo,
				variables: {
					input, // Use the input variable directly
				},
			})
			const newTodo = result.data.createTodo
			setTodos([...todos, newTodo]) // Update state with new todo
		} catch (err) {
			console.error("Error creating todo:", err)
			// Handle errors appropriately (e.g., display error message)
		} finally {
			setName("") // Clear input after adding
		}
	}

	useEffect(() => {
		const fetchTodos = async () => {
			try {
				const client = generateClient() // Generate the client within the function
				const todosData = await client.graphql({ query: listTodos })
				setTodos(todosData.data.listTodos.items)
			} catch (err) {
				console.error("Error fetching todos:", err)
			}
		}

		fetchTodos()
	}, []) // Empty dependency array to run only on mount

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={name}
				onChangeText={onChangeText}
				placeholder="Add a Todo"
			/>
			<TouchableOpacity onPress={addTodo} style={styles.buttonContainer}>
				<Text style={styles.buttonText}>Add +</Text>
			</TouchableOpacity>
			{todos.map((todo) => (
				<Text key={todo.name} style={styles.name}>
					{todo.name}
				</Text>
			))}
		</View>
	)
}

export default App

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 10,
		paddingTop: 50,
	},
	input: {
		height: 50,
		borderBottomWidth: 2,
		borderBottomColor: "blue",
		marginVertical: 10,
	},
	buttonContainer: {
		backgroundColor: "#34495e",
		marginTop: 10,
		marginBottom: 10,
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 24,
	},
	todo: {
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		paddingVertical: 10,
	},
	name: { fontSize: 16 },
})
