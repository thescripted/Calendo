class User {
  constructor(id: number) {
    this.id = id
  }

  id: number

  assignColor() {
    return 1
  }
}

const userInstance = new User(25)
export default userInstance
