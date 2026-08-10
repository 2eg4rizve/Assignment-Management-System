param([string]$BaseUrl = "http://localhost:5096/api/v1")

$ErrorActionPreference = "Stop"

function Invoke-Api($Method, $Path, $Token, $Body) {
    $parameters = @{
        Uri = "$BaseUrl/$Path"
        Method = $Method
        Headers = @{ Authorization = "Bearer $Token" }
        ContentType = "application/json"
    }
    if ($null -ne $Body) {
        $parameters.Body = $Body | ConvertTo-Json -Depth 10
    }
    try {
        Invoke-RestMethod @parameters
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $detail = $reader.ReadToEnd()
        throw "$Method $Path failed with HTTP $status. $detail"
    }
}

function Login($Email) {
    $body = @{ email = $Email; password = "Demo123!" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body $body
}

$admin = Login "admin@assignment.local"
$teacher = Login "teacher@assignment.local"
$student = Login "student@assignment.local"
$suffix = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

$course = Invoke-Api Post "courses" $admin.accessToken @{
    code = "LIVE-$suffix"
    name = "Live workflow course"
    description = "Disposable release verification data"
    academicYear = "2026"
    section = "E2E"
}
$subject = Invoke-Api Post "subjects" $admin.accessToken @{
    code = "L$suffix"
    name = "Live workflow subject"
    description = "Disposable release verification data"
}
$teaching = Invoke-Api Post "teaching-assignments" $admin.accessToken @{
    teacherId = $teacher.user.id
    courseId = $course.id
    subjectId = $subject.id
}
$null = Invoke-Api Post "enrollments" $admin.accessToken @{
    studentId = $student.user.id
    courseId = $course.id
}
$assignment = Invoke-Api Post "assignments" $teacher.accessToken @{
    teachingAssignmentId = $teaching.id
    title = "Live workflow assignment $suffix"
    description = "Submit, grade, and publish feedback."
    deadlineUtc = [DateTimeOffset]::UtcNow.AddDays(1).ToString("o")
    maximumMarks = 100
    allowResubmission = $true
    publishNow = $true
}
$submission = Invoke-Api Post "assignments/$($assignment.id)/submission" $student.accessToken @{
    answerText = "Live PostgreSQL workflow answer $suffix"
}
$graded = Invoke-Api Put "submissions/$($submission.id)/grade" $teacher.accessToken @{
    marksAwarded = 91
    feedback = "Live workflow verified"
    publishGrade = $true
    rowVersion = $submission.rowVersion
}
$visible = Invoke-Api Get "submissions/$($submission.id)" $student.accessToken $null

if ($visible.marksAwarded -ne 91 -or $visible.feedback -ne "Live workflow verified") {
    throw "Published grade or feedback was not visible to the student."
}

try {
    $null = Invoke-Api Get "users" $student.accessToken $null
    throw "Student unexpectedly accessed the admin users endpoint."
} catch {
    if ($_.Exception.Message -notmatch "HTTP 403") { throw }
}

try {
    $null = Invoke-Api Post "courses" $teacher.accessToken @{
        code = "DENY-$suffix"; name = "Must not be created"
    }
    throw "Teacher unexpectedly created a course."
} catch {
    if ($_.Exception.Message -notmatch "HTTP 403") { throw }
}

[pscustomobject]@{
    Course = $course.code
    Assignment = $assignment.id
    Submission = $submission.id
    Grade = $visible.marksAwarded
    Feedback = $visible.feedback
    CrossRoleDenials = 2
}
