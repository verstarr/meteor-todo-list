Tasks = new Mongo.Collection("tasks");
 
if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
      if (! Meteor.userId() || Meteor.call("ownTask", this._id, this.username)) {
        console.log((! Meteor.userId() || Meteor.call("ownTask", this._id, this.username)).toString())
        console.log("Got to new-task")
        console.log("user: " + Meteor.user().username);
        console.log("task owner: " + this.username)
        throw new Meteor.Error("not-authorized");
      }
      else {
        // Get value from form element
        var text = event.target.text.value;

        // Insert a task into the collection
        Meteor.call("addTask", text);
        console.log("added task")
      }
      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      if (! Meteor.userId() || Meteor.call("ownTask", this._id, this.username)) {
        console.log((! Meteor.userId() || !Meteor.call("ownTask", this._id, this.username)).toString())
        console.log("Got to toggle-checked")
        console.log("user: " + Meteor.user().username);
        console.log("task owner: " + this.username)
        throw new Meteor.Error("not-authorized");
      }
      else {
        // Set the checked property to the opposite of its current value
        Meteor.call("setChecked", this._id, ! this.checked);
        console.log("checked task")
      }

    },
    "click .delete": function () {
      if (! Meteor.userId() || Meteor.call("ownTask", Meteor.user().username, this.username)) {
        console.log(! Meteor.userId() || Meteor.call("ownTask", Meteor.user().username, this.username))
        console.log("Got to delete")
        console.log("user: " + Meteor.user().username);
        console.log("task owner: " + this.username)
        throw new Meteor.Error("not-authorized");
      }
      else {
        Meteor.call("deleteTask", this._id);
        console.log("deleted task")
      }

    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  ownTask: function (currentUser, taskOwner) {
    console.log("currentUser: " + currentUser)
    console.log("taskOwner: " + taskOwner)
    console.log(currentUser == taskOwner)
    if (currentUser == taskOwner) {
      return false;
    }
    else {
      return true;
    }
  }
});