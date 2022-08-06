'use strict';

function create_new_class(){
  makeNewCourse_withExistingYear7TemplatesForClass("R4-7YCo");
  makeNewCourse_withExistingYear7TemplatesForClass("R4-7XCo");
  makeNewCourse_withExistingYear8TemplatesForClass("R4-8YCo");
  makeNewCourse_withExistingYear8TemplatesForClass("R4-8XCo");
}

function newCourse(year, className) {
  const courseDescriptor = {
    name: className,
    section: 'class.year '+year,
    descriptionHeading: 'Computer Science and IT',
    //description: "This is where I describe the course",
    room: 'A12',
    ownerId: 'me',
    courseState: 'PROVISIONED'
  };
  const course = Classroom.Courses.create(courseDescriptor);
  Logger.log('Course created: %s (%s)', course.name, course.id)
  return course;
}

function makeNewCourse_withExistingYear7TemplatesForClass(className){
  makeNewCourse_withExistingTemplatesForYear(Year.Year7, className);
}

function makeNewCourse_withExistingYear8TemplatesForClass(className){
  makeNewCourse_withExistingTemplatesForYear(Year.Year8, className);
}

function makeNewCourse_withExistingTemplatesForYear(year,className){
  makeNewCourse_fromExistingCoursesWhere(
    course =>
      course_isTemplate(course) &&
      course_year(course) == year
    ,
    year,
    className
  );
}

function makeNewCourse_fromExistingCoursesWhere(course_predicate,year,className){
  const newClass= newCourse(year,className);
  doActionOnCourses(
    existingCourse => 
    {
      if (course_predicate(existingCourse)) {
        course_addTemplate(newClass,existingCourse)
      }
    }
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

