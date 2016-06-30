(function($) {
    var db;

    var $noteInfo = $("#noteInfo");

    var $newNote = $("#newNote");

    var openRequest = indexedDB.open("noteListApp", 1);

    //creating new note database 
    openRequest.onupgradeneeded = function(evt) {

        var listNoteDb = evt.target.result;
        var objectStore;          
        if (!listNoteDb.objectStoreNames.contains("note")) {
            objectStore = listNoteDb.createObjectStore("note", {
                keyPath: "id",
                autoIncrement: true
            });
        }
    };

    openRequest.onsuccess = function(evt) {
        db = evt.target.result;

        db.onerror = function(event) {

            alert("DB error: " + event.target.errorCode);
        };

        showNoteDetails();
        noteCount();
    };

    //Date time 
    function noteCreateDate(dateVal) {
        if (!dateVal) return "";
        var dtVal = dateVal.toDateString();
        var timeVal = dateVal.toLocaleTimeString();
        var notedate = dtVal + ' , ' + timeVal;
        return notedate;

    };

    //counter for notes
    function noteCount() {
            db.transaction(["note"], "readonly").objectStore("note").count().onsuccess = function(count) {
            $("#noteCounter").text(" Note Counter : " + count.target.result);
        };
    }

    //create new note button
    document.getElementById('createNoteBtn').addEventListener('click', function() {
        $("#message").val("");
        $("#name").val("");
        $("#subject").val("");
        $("#key").val("");
        $noteInfo.hide();
        $newNote.show();
    });

    //Saving Note	
    $("#saveNoteBtn").on("click", function() {

        var name = $("#name").val();
        var subject = $("#subject").val();
        var message = $("#message").val();
        var key = $("#key").val();

        var saveDb = db.transaction(["note"], "readwrite");

        if (key === "") {
            saveDb.objectStore("note")
                .add({
                    name: name,
                    subject: subject,
                    message: message,
                    datetime: new Date()
                });
        } else {
            saveDb.objectStore("note")
                .put({
                    name: name,
                    subject: subject,
                    message: message,
                    datetime: new Date(),
                    id: Number(key)
                });
        }

        saveDb.oncomplete = function(event) {
            $("#name").val("");
            $("#key").val("");
            $("#subject").val("");
            $("#message").val("");

            showNoteDetails();
            noteCount();
            $newNote.hide();
        };

        return false;
    });


    //render notes list  
    function showNoteDetails() {

        var transaction = db.transaction(["note"], "readonly");
        var content = "<table class='table table-bordered table-condensed table-hover'><thead><tr><th>Subject</th><th>Date-Time</th><th>Options</td></thead><tbody>";

        transaction.oncomplete = function(event) {
            $("#appViewTbl").html(content);
        };

        var allNote = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                content += "<tr data-key=\"" + cursor.key + "\"><td class=\"noteSubject\">" + cursor.value.subject + "</td>";
                content += "<td>" + noteCreateDate(cursor.value.datetime) + "</td>";

                content += "<td><a class=\"btn btn-info info\">Show</a> <a class=\"btn btn-danger delete\">Delete</a></td>";
                content += "</tr>";
                cursor.continue();
            } else {
                content += "</tbody></table>";
            }
        };

        var objectStore = transaction.objectStore("note");

        objectStore.openCursor().onsuccess = allNote;
    }


    //display selected note message - Show button  
    $("#appViewTbl").on("click", "a.info", function() {
        var thisId = $(this).parent().parent().data("key");

        var transaction = db.transaction(["note"]);
        var objectStore = transaction.objectStore("note");
        var request = objectStore.get(thisId);

        request.onsuccess = function(event) {

            var note = request.result;

            var dbDate = note.datetime;
            var dtV = dbDate.toDateString();
            var tV = dbDate.toLocaleTimeString();
            var ftdate = dtV + ' , ' + tV;

            var content = "<div><center><h2>Note Details</h2></center></div><p>" + "<span>Name : </span>" + note.name + "<p>";
            content += "<p>" + "<span>Subject : </span>" + note.subject + "<p>";

            content += "<p>" + "<span>Message : </span>" + note.message + "</p>";

            content += "<p>" + "<span>Created Date/Time : </span>" + ftdate;


            $noteInfo.html(content).show();

            var $delBtn = $('<button  id = "detialsDelBtn" type="button" class="btn btn-danger">Delete</button></div>');
            $delBtn.click(function() {

                deleteShowingNote(thisId);
            });
            $('#noteInfo').append($delBtn);

            $newNote.hide();

        };
    });

//Extra delete button for Note details
    function deleteShowingNote(key) {
        var transaction = db.transaction(['note'], 'readwrite');
        var store = transaction.objectStore('note');
        var request = store.delete(key);
        request.onsuccess = function(evt) {
            showNoteDetails();
            noteCount();
            $noteInfo.hide();
            $newNote.hide();
        };
    }

    //List note delete - Delete button
    $("#appViewTbl").on("click", "a.delete", function(e) {
        var thisId = $(this).parent().parent().data("key");

        var deldb = db.transaction(["note"], "readwrite");
        var request = deldb.objectStore("note").delete(thisId);
        deldb.oncomplete = function(event) {
            showNoteDetails();
            noteCount();
            $noteInfo.hide();
            $newNote.hide();
        };
        return false;
    });

$("#message").keyup(function(){
  $("#count").text($(this).val().length);
});


})(jQuery);