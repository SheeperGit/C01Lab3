import React, {useState, useEffect} from "react"
import './App.css';
import Dialog from "./Dialog";
import Note from "./Note";

function App() {

  // -- Backend-related state --
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState(undefined)

  // -- Dialog props-- 
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogNote, setDialogNote] = useState(null)

  
  // -- Database interaction functions --
  useEffect(() => {
    const getNotes = async () => {
      try {
        await fetch("http://localhost:4000/getAllNotes")
        .then(async (response) => {
          if (!response.ok) {
            console.log("Served failed:", response.status)
          } else {
              await response.json().then((data) => {
              getNoteState(data.response)
          }) 
          }
        })
      } catch (error) {
        console.log("Fetch function failed:", error)
      } finally {
        setLoading(false)
      }
    }

    getNotes()
  }, [])

  const deleteNote = (entry) => {
    try {
      fetch(`http://localhost:4000/deleteNote/${entry._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (response) => {
        if (!response.ok) {
          console.log("Failed to delete note:", response.status);
        } else {
          // Update state after successful deletion //
          deleteNoteState(entry._id);
        }
      });
    } catch (error) {
      console.log("Failed to delete note:", error);
    }
  };

  const deleteAllNotes = () => {
    try {
      fetch("http://localhost:4000/deleteAllNotes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (response) => {
        if (!response.ok) {
          console.log("Failed to delete all notes:", response.status);
        } else {
          // Update state after successful (mass) deletion of all notes //
          deleteAllNotesState();
        }
      });
    } catch (error) {
      console.log("Failed to delete all notes:", error);
    }
  };
  
  // -- Dialog functions --
  const editNote = (entry) => {
    setDialogNote(entry)
    setDialogOpen(true)
  }

  const postNote = () => {
    setDialogNote(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogNote(null)
    setDialogOpen(false)
  }

  // -- State modification functions -- 
  const getNoteState = (data) => {
    setNotes(data)
  }

  const postNoteState = (_id, title, content) => {
    setNotes((prevNotes) => [...prevNotes, {_id, title, content}])
  }

  // TODO: Update local state by removing the note with ID `noteId //
  const deleteNoteState = (noteId) => {
    setNotes((prevNotes) => prevNotes.filter((entry) => entry._id !== noteId));
  };

  // TODO: Update local state by removing all notes //
  const deleteAllNotesState = () => {
    setNotes([]);
  }

  // TODO: Update local state by patching note w/ ID `_id`, given (title, content) //
  const patchNoteState = (_id, title, content) => {
    setNotes((prevNotes) =>
      prevNotes.map((entry) =>
        entry._id === _id
          ? {
              ...entry,
              title: title !== undefined ? title : entry.title,
              content: content !== undefined ? content : entry.content,
            }
          : entry
      )
    );
  };
  

  return (
    <div className="App">
      <header className="App-header">
        <div style={dialogOpen ? AppStyle.dimBackground : {}}>
          <h1 style={AppStyle.title}>QuirkNotes</h1>
          <h4 style={AppStyle.text}>The best note-taking app ever </h4>

          <div style={AppStyle.notesSection}>
            {loading ?
            <>Loading...</>
            : 
            notes ?
            notes.map((entry) => {
              return (
              <div key={entry._id}>
                <Note
                entry={entry} 
                editNote={editNote} 
                deleteNote={deleteNote}
                />
              </div>
              )
            })
            :
            <div style={AppStyle.notesError}>
              Something has gone horribly wrong!
              We can't get the notes!
            </div>
            }
          </div>

          <button onClick={postNote}>Post Note</button>
          {notes && notes.length > 0 && 
          <button
              onClick={deleteAllNotes}
              >
              Delete All Notes
          </button>}

        </div>

        <Dialog
          open={dialogOpen}
          initialNote={dialogNote}
          closeDialog={closeDialog}
          postNote={postNoteState}
          patchNote={patchNoteState}
          />

      </header>
    </div>
  );
}

export default App;

const AppStyle = {
  dimBackground: {
    opacity: "20%", 
    pointerEvents: "none"
  },
  notesSection: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: "center"
  },
  notesError: {color: "red"},
  title: {
    margin: "0px"
  }, 
  text: {
    margin: "0px"
  }
}