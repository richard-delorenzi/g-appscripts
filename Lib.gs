/*Notes
 * For this to run, you need to add the service: google classroom api
 *
 * @see https://developers.google.com/classroom/reference/rest/v1/courses/list
 */

'use strict';

function nop(){}

function doActionOnCourses(action) {
  function protected_action(){
    try {
      action.apply(null,arguments);
    }
    catch (err){
      Logger.log('Warn: No access to a cource');
    }
  }
  doActionOn(
    optionalArgs => {
      var response = Classroom.Courses.list(optionalArgs);
      response.list=response.courses;
      return response;
    },
    protected_action
  ); 
}

function courseDoActionOnAssignments(course, action){
  doActionOn(
    optionalArgs => {
      var response = Classroom.Courses.CourseWork.list(course.id,{...optionalArgs, courseWorkStates:["PUBLISHED","DRAFT"]});
      response.list=response.courseWork;
      return response;
    },
    action
  ); 
}

function courseDoActionOnTopics(course, action){
  doActionOn(
    optionalArgs => {
      var response = Classroom.Courses.Topics.list(course.id,optionalArgs);
      response.list=response.topic;
      return response;
    },
    action
  ); 
}

function doActionOn(lister,action) {

  function iterate(list){
    list.forEach(element => action(element));
  }

  let is_exit=false;
  let token="";

  while ( !is_exit) {
    const optionalArgs = {
      pageSize: 10,
      pageToken: token
    };
    
    const response = lister(optionalArgs);
    const list = response.list;
    token = response.nextPageToken;

    if (!list || list.length === 0) {
      is_exit=true;
    } else {
      iterate(list);
    }

    //Logger.log("token=%s", token);
    if (token == null) is_exit=true;
  }
  //Logger.log('No more courses found.');
}

/*google classroom built-in states */

function course_isActive(course){
  return course.courseState === "ACTIVE";
}

function course_isArchived(course){
  return course.courseState === "ARCHIVED";
}

function course_isDeclined(course){
  return course.courseState === "DECLINED";
}

function assignment_isScheduled(assignment){
  return assignment.hasOwnProperty("scheduledTime");
}

/* sections and types
* used to catogorise my classes
*/

const Section = {
  Type: 0,
  Year: 1,
  Unit: 2
};

const Year = {
  Year7: 7,
  Year8: 8,
  Year9: 9
};

function course_section(course, section){
  return course_isActive(course) ?
     course.section?.split(".")[section]?.toLowerCase().replace(/\s+/g, "") ?? "":
     ""
}

function course_type(course){
  return course_section(course,Section.Type);
}

function course_isActiveClass(course){
  //:todo: improve: not template only elimitates most non classes
  return course_isActive(course) && !course_isTemplate(course);
}

function course_isTemplate(course){
  return course_type(course) === "template"
}

function course_isRealClass(course){
  return course_type(course) === "class"
}

function course_year(course){
  const year_text = course_section(course,Section.Year);
  const regexp = /year(\d+)/;
  const match = year_text.match(regexp);
  const array =
    match !== null ? 
    [...match] :
    null;
  const number_as_text =
    array !== null ?
    array[1] :
    "0";
  const number = +number_as_text;

  return number;
}

function course_unit(course){
  return course_section(course,Section.Unit);
}

/*logging*/

function courseLog(course, msg="course"){
  if (false){
    coursePrintSummary(course,0,msg);
  }else{
    Logger.log(msg+"=\n %s",
      JSON.stringify(course,null,3)
    );
  }
}

function coursePrintSummary(course, indent_amount=0, msg="course"){
  Logger.log(" ".repeat(indent_amount)+msg+": name=%s id=%s section=%s room=%s state=%s", 
    course.name, 
    course.id,
    course.section,
    course.room,
    course.courseState
  );
}

function assignmentLog(assignment, msg="assignment") {
  Logger.log(msg+"=\n %s", 
    JSON.stringify(assignment,null,3)
  );
}

class Topics {
  constructor (course){
    if (course){
      this.topics=courseListOfTopics(course);
    }else{
      this.topics={};
    }
  }

  courseTopic(course,existingCourse,existingCourseWork){
    const existingTopic=Classroom.Courses.Topics.get(existingCourse.id,existingCourseWork.topicId);
    //Logger.log("existingTopic: %s", JSON.stringify(existingTopic));
    const topicName=existingTopic.name;

    const newTopicId = this.topics[topicName] ??
      Classroom.Courses.Topics.create(existingTopic,course.id).topicId;
    
    this.topics[topicName]=newTopicId;
    return newTopicId;
  }
}





