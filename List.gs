'use strict';

function logActiveCourses(){
  logCoursesWhere(course_isActive);
}

function logAllCourses(){
  logCoursesWhere( _ => true );
}

function logArchivedCourses(){
  logCoursesWhere(course_isArchived);
}

function logAllAssignments(){
  logAssignmentInCourseWhereWhere(_ => true, _ => true);
}

function logNameOfScheduledAssignments(){
  function assignmentCourseLogSchedTime(assignment,course){
    Logger.log(`Scheduled=\n ${course.name} ${course.alternateLink} ${assignment.title} ${assignment.scheduledTime}`
    );
  }

  doActionOnAssignmentInCourseWhereWhere(assignmentCourseLogSchedTime, assignment_isScheduled, course_isActiveClass);
}

function doActionOnAssignmentInCourseWhereWhere(assignmentAction, assignmentPredicate, coursePredicate){
  doActionOnCourses(
    course => {
      if(coursePredicate(course)){
        courseDoActionOnAssignments(course,
          assignment => {
            if(assignmentPredicate(assignment)){
              assignmentAction(assignment,course);
            }
          }
        );
      }
    }
  );
}

function logCoursesWhere(coursePredicate){
  doActionOnCourses(
    course => {
      if (coursePredicate(course)){
        courseLog(course);
      }
    }
  );
}

function courseListOfTopics(course){
  let topics={};
  courseDoActionOnTopics(
    course,
    topic => {
      topics[topic.name]=topic.topicId;
    }
  );
  return topics;
}



