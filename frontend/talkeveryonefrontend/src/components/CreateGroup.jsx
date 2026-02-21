"use client"

import { useState } from "react"
import { MdOutlineGroupAdd } from "react-icons/md"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

import { InboxIcon } from "lucide-react"

export default function CreateGroup() {

  // ✅ Dummy users list (Backend se aayega)
  const users = [
    { _id: "101", name: "Ayush", username: "ayush7380" },
    { _id: "102", name: "Rahul", username: "rahul123" },
    { _id: "103", name: "Anshika", username: "anshi99" },
  ]

  // ✅ Group name state
  const [groupName, setGroupName] = useState("")

  // ✅ Selected user IDs state
  const [selectedUsers, setSelectedUsers] = useState([])

  // ✅ Checkbox toggle function
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId) // remove
        : [...prev, userId] // add
    )
  }

  // ✅ Submit handler
  const handleCreateGroup = (e) => {
    e.preventDefault()

    const groupData = {
      name: groupName,
      members: selectedUsers,
    }

    console.log("Group Created Data:", groupData)

    // ✅ Backend API call example:
    /*
    axios.post("/api/group/create", groupData)
    */

    alert("Group Created Successfully!")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MdOutlineGroupAdd />
          Group
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        
        <form onSubmit={handleCreateGroup}>
          <DialogHeader>
            <DialogTitle>Add Group Members</DialogTitle>
          </DialogHeader>

          <div className="mx-1 my-2">
                <Input placeholder="Search or Start a new chat" className="bg-gray-200 cursor-pointer rounded-lg hover:border-2 border-gray-400"/>
            </div>

          {/* ✅ Group Name Input */}
          <div className="space-y-2 mt-4 mx-1">
            {/* <Label>Group Name</Label> */}
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
            />
          </div>

          {/* ✅ Members List */}
          <div className="mt-5 space-y-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3"
              >
                {/* Checkbox */}
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onCheckedChange={() => handleSelectUser(user._id)}
                />

                {/* User Card */}
                <Item variant="outline" size="xs" className="w-full">
                  <ItemMedia variant="icon">
                    <InboxIcon />
                  </ItemMedia>

                  <ItemContent>
                    <ItemTitle>{user.name}</ItemTitle>
                    <ItemDescription>{user.username}</ItemDescription>
                  </ItemContent>
                </Item>
              </div>
            ))}
          </div>

          {/* Footer */}
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button type="submit">
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
