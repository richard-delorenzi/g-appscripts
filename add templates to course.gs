'use strict';

function run(){
  populate_classes("7","2022-r1");
}

function populate_classes(year, rotation){
   doActionOnCourses(
    destination_course => {
      if ( is_populatable(destination_course,year,rotation) ){
        log_populating(destination_course);
        doActionOnCourses(
          source_course => {
            if ( is_material_to_populate(source_course,year,rotation) ){
              log_with(source_course);
            }
          }
        );
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
    course_unit(course) == rotation
  );
}

function is_material_to_populate(course,year,rotation){
  return (
    course_isTemplate(course) &&
    course_year(course) == year
  );
}

function course_addTemplate(course, templateCourse){

  let topics= new Topics(course);

  Logger.log('found template: name=%s id=%s section=%s room=%s state=%s', 
    templateCourse.name, 
    templateCourse.id,
    templateCourse.section,
    templateCourse.room,
    templateCourse.courseState
  );

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
        const msg="Teacher: form copy is broken: copy it manualy";
        delete cw.materials;
        cw.title=cw.title+" #" +msg
        cw.description=msg+"\nFrom: "+ templateCourse.name;
      }

      Logger.log('work=%s', JSON.stringify(cw));
      Classroom.Courses.CourseWork.create(cw,course.id);
    }
  );
}

