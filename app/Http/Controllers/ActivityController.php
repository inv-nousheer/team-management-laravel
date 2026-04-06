<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\ActivityTypes;
use App\Models\Activities;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\UTCDateTime;
use Carbon\Carbon;
use OpenApi\Annotations as OA;

class ActivityController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/ping",
     *     summary="Ping endpoint for Swagger validation",
     *     tags={"Utility"},
     *     @OA\Response(
     *         response=200,
     *         description="Pong"
     *     )
     * )
     */
    public function ping() {
        return response()->json(['message' => 'pong']);
    }
        /**
 * @OA\Get(
 *     path="/api/activities",
 *     summary="Get activities",
 *     tags={"Activities"},
 *     security={{"bearerAuth":{}}},
 *     @OA\Response(
 *         response=200,
 *         description="Success"
 *     )
 * )
 */
        public function index()
        {
            return ActivityTypes::all();

        }

        public function store(Request $request)
        {
            $data = $request->all();
            Log::info("message", ['data' => $data]);
            $data['date'] = Carbon::parse($data['date'])->utc();
            $data['expected_ending_time'] = Carbon::parse($data['expected_ending_time'])->utc();
            $activity = Activities::create($data);
            return response()->json($activity, 201);

        }

        public function show($id)
        {
            // Logic to retrieve and return a specific activity by ID
        }

        public function update(Request $request, $id)
        {
            $data = $request->all();
            Log::info("message", ['data' => $data]);
            $data['date'] = Carbon::parse($data['date'])->utc();
            $data['expected_ending_time'] = Carbon::parse($data['expected_ending_time'])->utc();
            $activity = Activities::find($id);
            if (!$activity) {
                return response()->json(['message' => 'Activity not found'], 404);
            }
            $activity->update($data);
            return response()->json($activity);

        }

        public function destroy($id)
        {
            // Logic to delete an activity by ID
        }
        public function members(){
             return Member::all();
        }
        public function getActivitiesByMonthYear(Request $request)
        {
            $month = $request->query('month');
            $year = $request->query('year');

            $activities = Activities::whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get();

            return response()->json($activities);
        }
        public function addMember(Request $request)
        {
            $data = $request->all();
            Log::info("message", ['data' => $data]);
            $member = Member::create($data);
            return response()->json($member, 201);
        }
        public function updateMember(Request $request, $id)
        {
            $data = $request->all();
            Log::info("message", ['data' => $data]);
            $member = Member::find($id);
            if (!$member) {
                return response()->json(['message' => 'Member not found'], 404);
            }
            $member->update($data);
            return response()->json($member);

        }
        public function addType(Request $request)
        {
            $data = $request->all();
            Log::info("message", ['data' => $data]);
            $type = ActivityTypes::create($data);
            return response()->json($type, 201);
        }
        public function updateActivityType(Request $request, $id)
        {
            $data = $request->all();
            Log::info("message", ['data' => $data]);
            $type = ActivityTypes::find($id);
            if (!$type) {
                return response()->json(['message' => 'Activity type not found'], 404);
            }
            $type->update($data);
            return response()->json($type);

        }

}
