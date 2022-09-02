'use strict';

const dummy_run = false;

function run(){
  populate_classes("1","2022","web_design");
}

function populate_classes(year, rotation, unit="ALL-UNITS"){
  doActionOnCoursesWhere(
    destination_course => is_populatable(destination_course,year,rotation),
    destination_course => {
      populate_one_class(destination_course,year,unit);
      tag_completted_class(destination_course);
    }
  );
}

function populate_one_class(destination_course, year, unit){
  log_populating(destination_course);
  doActionOnCoursesWhere(  
    source_course => is_material_to_populate(source_course,year,unit),
    source_course => {
      log_with(source_course);
      if ( !dummy_run ){
        course_addTemplate(destination_course, source_course);
      }
    } 
  );
}

function tag_completted_class(course){
  if ( !dummy_run ){
    const iso_date=new Date().toISOString();
    courseMakeTopicWithName(course, "Added work "+iso_date);
  }else{
    Logger.log("Tagging class as complete");
  }
}

function doActionOnCoursesWhere(course_pred, course_action){
  doActionOnCourses(
    course => {
      if (course_pred(course)){
        course_action(course);
      }
    }
  );
}

function log_populating(course){
  Logger.log("Populating:");
  coursePrintSummary(course,2);
  Logger.log("  With:");
}

function log_with(course){
  coursePrintSummary(course,4);
}

function is_populatable(course,year,rotation){
  return (
    course_isRealClass(course) &&
    course_year(course) == year &&
    course_unit(course) === rotation
  );
}

function is_material_to_populate(course,year,unit){
  return (
    course_isTemplate(course) &&
    course_year(course) == year &&
    (unit === "ALL-UNITS" || course_unit(course) === unit)
  );
}

function course_addTemplate(course, templateCourse){

  let topics= new Topics(course);

  if (false){
    Logger.log('found template: name=%s id=%s section=%s room=%s state=%s', 
      templateCourse.name, 
      templateCourse.id,
      templateCourse.section,
      templateCourse.room,
      templateCourse.courseState
    );
  }

  courseDoActionOnAssignments(templateCourse,
    courseWork => {
      let cw=courseWork;
      delete cw.id;
      delete cw.courseId;
      delete cw.alternateLink;
      delete cw.creationTime;
      delete cw.updateTime;
      delete cw.associatedWithDeveloper;
      delete cw.creatorUserId;
      delete cw.gradeCategory;
      delete cw.assignment;
      delete cw.state;
      
      cw.topicId=topics.courseTopic(course,templateCourse,cw);

      function workMaterialsContainsAForm(cw){
        return cw?.materials?.some( i => i.hasOwnProperty('form')) ?? false;
      }

      if (workMaterialsContainsAForm(cw)){
        const msg="ERROR: form copy is broken — copy it manualy";
        delete cw.materials;
        cw.title=cw.title+" #" +msg
        cw.description=msg+"\nFrom: "+ templateCourse.name;
      }

      //Logger.log('work=%s', JSON.stringify(cw));
      Classroom.Courses.CourseWork.create(cw,course.id);
    }
  );
}

