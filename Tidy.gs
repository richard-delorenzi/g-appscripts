'use strict';

function tidyCourses(){
  doActionOnCourses(
    course => {
      courseDeleteDeclined(course);
      courseDeleteArchived(course);
    }
  );
}

function courseDeleteArchived(course){
  if (course_isArchived(course)){
    courseDelete(course)
  }
}

function courseDeleteDeclined(course){
  if (course_isDeclined(course)){
    courseArchive(course);
    courseDelete(course);
  }
}

function courseArchive(course){
  //courseLog(course, "Archiving");
  const optArgs = { updateMask: "courseState" }; 
    
  Classroom.Courses.patch({
    courseState: "ARCHIVED"
  }, course.id,  optArgs );
}

function courseDelete(course){
  courseLog(course,"Deleting");
  Classroom.Courses.remove(course.id);
}
