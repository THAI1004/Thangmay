const fs = require('fs');

let s = fs.readFileSync('src/project/project.service.ts', 'utf8');
s = s.replace(/findAllProjectsMaintennce\(\) \{\s+return this\.projectRepository\.find\(\{\s+where: \{ type: 'BAOTRI' \},\s+relations: \['projectStaff', 'projectStaff\.staff', 'projectSteps', 'projectSteps\.staff'\],\s+\}\)\s+\}/,
`findAllProjectsMaintennce() {
    const toDay = new Date();
    return this.projectRepository.find({
      where: {
        type: 'BAOTRI',
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: false,
        },
      },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff', 'historyMaintenance'],
    })
  }`);

s = s.replace(/findProjectsMaintennceByStaffId\(staffId: number\) \{\s+return this\.projectRepository\.find\(\{\s+where: \{\s+type: 'BAOTRI',\s+projectStaff: \{\s+staff: \{\s+id: staffId,\s+\},\s+\},\s+\},\s+relations: \['projectStaff', 'projectStaff\.staff', 'projectSteps', 'projectSteps\.staff'\],\s+\}\)\s+\}/,
`findProjectsMaintennceByStaffId(staffId: number) {
    const toDay = new Date();
    return this.projectRepository.find({
      where: {
        type: 'BAOTRI',
        projectStaff: {
          staff: {
            id: staffId,
          },
        },
        historyMaintenance: {
          timeStart: LessThan(toDay),
          timeEnd: MoreThan(toDay),
          free: false,
        },
      },
      relations: ['projectStaff', 'projectStaff.staff', 'projectSteps', 'projectSteps.staff', 'historyMaintenance'],
    })
  }`);

fs.writeFileSync('src/project/project.service.ts', s);
console.log("Done");
